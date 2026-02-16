async function invokeCliMainExecution(args, dependencies) {
  const {
    executeCliMainExecution,
    buildCliMainPipelineInputs,
    buildCliMainPipelineDependencies,
    buildCliMainFlowPipeline,
    executeCliMainFlow,
    handleCliUsageExit,
    dependencySources,
  } = dependencies;

  return executeCliMainExecution(args, {
    buildCliMainPipelineInputs,
    buildCliMainPipelineDependencies,
    buildCliMainFlowPipeline,
    executeCliMainFlow,
    handleCliUsageExit,
    ...dependencySources,
  });
}

module.exports = {
  invokeCliMainExecution,
};
