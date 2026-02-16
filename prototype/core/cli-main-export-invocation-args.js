function buildCliMainExportInvocationArgs(dependencies) {
  const { moduleObject, buildCliMainExports, mainExportDependencies } = dependencies;
  return [moduleObject, buildCliMainExports(mainExportDependencies)];
}

module.exports = {
  buildCliMainExportInvocationArgs,
};
