class ModuleNode {
  constructor(path) {
    this.path = path;
    this.type = path.endsWith("css") ? "css" : "js";
    this.initiators = new Set();
    this.isChanged = true;
    this.module = null;
    this.transpiledCode = null;
    this.transformResult = {
      // FIXME ?
      code: "",
    };
  }
}
class ModuleGraph {
  moduleMap = new Map();

  getModule(id) {
    return this.moduleMap.get(id);
  }
}

const globalModuleGraph = new ModuleGraph();

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
  const message = event.data;
  console.log("sandbox receive mes", message);
  updateCodeModule(message, globalModuleGraph);
  transpile(globalModuleGraph);
  evaluate(message, globalModuleGraph);
}
/**
 * 原始代码模块化
 * @param {*} message
 * @param {*} moduleGraph
 */
function updateCodeModule(message, moduleGraph) {
  const { codeMap } = message;
  let finalFileMap = codeMap; // {path:'', code: ''}
  Object.keys(finalFileMap).forEach((path) => {
    const codeFile = finalFileMap[path];
    let module = moduleGraph.getModule(path);
    if (!module) {
      const newModule = new ModuleNode(path);
      newModule.code = codeFile.code;
      newModule.isChanged = true;
      newModule.transpiledCode = codeFile.transpiledCode || null;
      moduleGraph.moduleMap.set(path, newModule);
      return;
    }
    if (module.code !== codeFile.code) {
      //FIXME code change ?
      module.code = codeFile.code;
      module.isChanged = true;
      module.transpiledCode = null;
      module.module = null;
    }
  });
}
// ② 转译模块
/**
 * 转译代码
 * @param {*} moduleGraph
 * @returns
 */
function transpile(moduleGraph) {
  const moduleMap = moduleGraph.moduleMap;
  moduleMap.forEach((codeModule) => {
    const code = codeModule.code;
    const path = codeModule.path;
    if (/\.jsx$/.test(path)) {
      codeModule.transpiledCode = babelTransform(code);
    }
    if (/\.json$/.test(path)) {
      codeModule.transpiledCode = `module.exports = ${code}`;
    }
    if (/\.css$/.test(path)) {
      codeModule.transpiledCode = insertCss(path, code);
    }
  });
}
function insertCss(id, css) {
  return `
 function createStyleNode(id, content){
   var styleNode = document.getElementById(id) || document.createElement('style');
   styleNode.setAttribute('id', id);
   styleNode.type = 'text/css'
   if(styleNode.stylesheet){
     styleNode.stylesheet.cssText = content
   }else{
     styleNode.innerHTML = ''
     styleNode.appendChild(document.createTextNode(content))
   }
   document.head.appendChild(styleNode)
 }
 createStyleNode(${JSON.stringify(id)}, ${JSON.stringify(css)})
 `;
}
function babelTransform(code) {
  return Babel.transform(code, {
    plugins: [["transform-modules-commonjs"], ["transform-react-jsx"]],
  }).code;
}
// ③ 执行代码
function evaluate(message, moduleGraph) {
  const { entry } = message;
  const entryModule = moduleGraph.getModule(entry);
  if (entryModule.isChanged) {
    evaluateCodeModule(entryModule, moduleGraph);
    return;
  }
}
/**
 * 执行代码(模拟CommonJS执行环境)
 * NOTE webpack?思路
 * @param {*} code 转译后的源代码
 * @param {*} require 自定义的获取模块函数
 * @param {*} module 是与当前源代码绑定的执行结果（一开始为空对象，eval执行后赋值）
 */
function evaluateCode(code, require, module) {
  // #1. 构建 require, module, exports 当前函数的上下文全局数据
  const exports = module.exports;
  const allGlobals = {
    require,
    module,
    exports,
  };
  const allGlobalsKeys = Object.keys(allGlobals).join(", ");
  const allGlobalsValues = Object.values(allGlobals);
  try {
    const newCode = `(function evaluate(${allGlobalsKeys}){${code}\n})`;
    eval(newCode).apply(this, allGlobalsValues);
    return exports;
  } catch (e) {
    let error = e;
    if (typeof e === "string") {
      error = new Error(e);
    }
    error.isEvalError = true;
    throw error;
  }
}
/**
 * defaultExternals, only for React App
 */
const defaultExternals = {
  react: "React",
  "react-dom": "ReactDOM",
};

function evaluateCodeModule(codeModule, moduleGraph) {
  codeModule.module = codeModule.module || getNewModule();

  function require(moduleName) {
    if (/^[./]/.test(moduleName)) {
      const modulePath = resolveModulePath(moduleName, codeModule, moduleGraph);
      const requireModule = moduleGraph.getModule(modulePath);
      if (requireModule.module) {
        return requireModule.module.exports;
      }
      requireModule.module = getNewModule();
      requireModule.initiators.add(codeModule);
      // NOTE 递归解析，构建所有的moduleGraph
      return evaluateCodeModule(requireModule, moduleGraph);
    }
    const exLib = window[moduleName] || window[defaultExternals[moduleName]];
    if (exLib) {
      return exLib;
    }
  }
  codeModule.isChanged = false;
  return evaluateCode(codeModule.transpiledCode, require, codeModule.module);
}
function getNewModule() {
  const exports = {};
  return {
    exports,
  };
}
function resolveModulePath(moduleName, codeModule, moduleGraph) {
  // # /
  let modulePath = moduleName;
  // # .
  if (moduleName.startsWith(".")) {
    const currentDir = path.dirname(codeModule.path || codeModule.id); // use path browserfly
    modulePath = path.resolve(currentDir, moduleName);
  }
  if (moduleGraph.getModule(modulePath)) {
    // check module is exists or not
    return modulePath;
  }
  const FILE_EXTNAME = [".jsx", ".js", ".json", ".css", "/index.js"];
  FILE_EXTNAME.some((ext) => {
    const withExtPath = `${modulePath}${ext}`;
    if (moduleGraph.getModule(withExtPath)) {
      modulePath = withExtPath;
      return true;
    }
  });
  return modulePath;
}
