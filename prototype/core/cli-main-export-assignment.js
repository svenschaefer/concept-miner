function assignCliMainExports(moduleObject, exportsObject) {
  moduleObject.exports = exportsObject;
  return moduleObject.exports;
}

module.exports = {
  assignCliMainExports,
};
