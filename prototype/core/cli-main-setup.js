function buildCliMainSetup(args, dependencies) {
  const {
    parseCliMainExecutionContext,
    buildCliMainFlowContext,
    bindCliRuntimeInvocation,
    buildCliMainFlowDependencies,
    parseDependencies,
    flowContextDependencies,
    runtimeInvocationDependencies,
    flowDependencies,
  } = dependencies;

  const parsed = parseCliMainExecutionContext(args, parseDependencies);
  const context = buildCliMainFlowContext(parsed, flowContextDependencies);
  const invokeCliRuntimeGeneration = bindCliRuntimeInvocation(runtimeInvocationDependencies);
  const cliMainFlowDependencies = buildCliMainFlowDependencies({
    ...flowDependencies,
    invokeCliRuntimeGeneration,
  });
  return {
    context,
    cliMainFlowDependencies,
  };
}

module.exports = {
  buildCliMainSetup,
};
