function buildCliMainPipelineDependencies(baseDependencies) {
  const {
    buildCliParseDependencies,
    buildCliFlowContextDependencies,
    buildCliRuntimeInvocationDependencies,
    buildCliFlowDependencies,
    buildCliMainSetupDependencies,
    invokeCliMainSetup,
  } = baseDependencies;

  return {
    buildCliParseDependencies,
    buildCliFlowContextDependencies,
    buildCliRuntimeInvocationDependencies,
    buildCliFlowDependencies,
    buildCliMainSetupDependencies,
    invokeCliMainSetup,
  };
}

module.exports = {
  buildCliMainPipelineDependencies,
};
