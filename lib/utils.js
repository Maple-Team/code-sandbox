var exports = {};
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
function require(moduleName) {
  // 处理路径问题
  if (moduleName.startsWith("./")) {
    if (!/.*\.(json|css)/.test(moduleName)) {
      const path = moduleName.replace(/\.\/(.*)/, (_, $1) => `/src/${$1}.jsx`);
      if (path) {
        const codeMap = window.transpiledCodeMap[path];
        const transpileCode = codeMap.transpileCode;
        eval(transpileCode);
      }
    } else {
      const path = moduleName.replace(/\.\/(.*)/, (_, $1) => `/src/${$1}`);
      return window.codeMap[path].code;
    }
  } else {
    return window[externals[moduleName]];
  }
}
