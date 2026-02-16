function buildCliMainSetupDependencies(baseDependencies) {
  const {
    parseCliMainExecutionContext,
    buildCliMainFlowContext,
    bindCliRuntimeInvocation,
    buildCliMainFlowDependencies,
    parseDependencies,
    flowContextDependencies,
    runtimeInvocationDependencies,
    flowDependencies,
  } = baseDependencies;

  return {
    parseCliMainExecutionContext,
    buildCliMainFlowContext,
    bindCliRuntimeInvocation,
    buildCliMainFlowDependencies,
    parseDependencies,
    flowContextDependencies,
    runtimeInvocationDependencies,
    flowDependencies,
  };
}

module.exports = {
  buildCliMainSetupDependencies,
};
