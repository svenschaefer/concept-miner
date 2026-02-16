function buildCliMainFlowPipeline(args, dependencies) {
  const {
    buildCliParseDependencies,
    buildCliFlowContextDependencies,
    buildCliRuntimeInvocationDependencies,
    buildCliFlowDependencies,
    buildCliMainSetupDependencies,
    invokeCliMainSetup,
    parseDependencyInputs,
    flowContextDependencyInputs,
    runtimeInvocationDependencyInputs,
    flowDependencyInputs,
    mainSetupCoreDependencies,
  } = dependencies;

  const parseDependencies = buildCliParseDependencies(parseDependencyInputs);
  const flowContextDependencies = buildCliFlowContextDependencies(flowContextDependencyInputs);
  const runtimeInvocationDependencies = buildCliRuntimeInvocationDependencies(runtimeInvocationDependencyInputs);
  const flowDependencies = buildCliFlowDependencies(flowDependencyInputs);
  const mainSetupDependencies = buildCliMainSetupDependencies({
    ...mainSetupCoreDependencies,
    parseDependencies,
    flowContextDependencies,
    runtimeInvocationDependencies,
    flowDependencies,
  });

  return invokeCliMainSetup({
    args,
    buildCliMainSetup: mainSetupCoreDependencies.buildCliMainSetup,
    mainSetupDependencies,
  });
}

module.exports = {
  buildCliMainFlowPipeline,
};
