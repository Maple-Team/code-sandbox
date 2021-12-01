function transpile(packageInfo) {
  const codeMap = packageInfo.codeMap;
  Object.keys(codeMap).forEach((path) => {
    const code = codeMap[path].code;
    if (/\.jsx$/.test(path)) {
      codeMap[path].transpileCode = Babel.transform(code, {
        plugins: [["transform-modules-commonjs"], ["transform-react-jsx"]],
      }).code;
    }
  });
  return codeMap;
}

/**
 * 执行代码(模拟CommonJS执行环境)
 * NOTE webpack?思路
 * @param {*} transpiledCode 转译后的源代码
 * @param {*} require 自定义的获取模块函数
 * @param {*} module 是与当前源代码绑定的执行结果（一开始为空对象，eval执行后赋值）
 */
function evaluateCode(transpiledCode, require, module) {
  // #1. 构建 require, module, exports 当前函数的上下文全局数据
  const allGlobals = {
    require,
    module,
    exports: module.exports,
  };
  const allGlobalsKeys = Object.keys(allGlobals).join(", ");
  const allGlobalsValues = Object.values(allGlobals);
  try {
    const newCode = `(function evaluate(${allGlobalsKeys}){${transpiledCode}\n})`;
    eval(newCode).apply(this, allGlobalsValues);
    return module.exports;
  } catch (error) {}
}
/**
 * defaultExternals, only for React App
 */
const defaultExternals = {
  react: "React",
  "react-dom": "ReactDOM",
};

function evaluateCodeModule(codeModule) {
  codeModule.module = codeModule.module || getNewModule();

  function require(moduleName) {
    const exlib = window[defaultExternals][moduleName];
    if (exlib) {
      // External资源
      return exlib;
    }
  }
  return evaluateCode(codeModule.transpileCode, require, codeModule.module);
}
function getNewModule() {
  const exports = {};
  return {
    exports,
  };
}
