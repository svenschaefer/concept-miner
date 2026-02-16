function buildCliMainExportAssignmentDependencies(baseDependencies) {
  const { moduleObject, buildCliMainExports, mainExportDependencies } = baseDependencies;
  return {
    moduleObject,
    buildCliMainExports,
    mainExportDependencies,
  };
}

module.exports = {
  buildCliMainExportAssignmentDependencies,
};
