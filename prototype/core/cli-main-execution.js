async function executeCliMainExecution(args, dependencies) {
  const {
    buildCliMainPipelineInputs,
    buildCliMainPipelineDependencies,
    buildCliMainFlowPipeline,
    executeCliMainFlow,
    handleCliUsageExit,
    pipelineInputSources,
    pipelineDependencySources,
  } = dependencies;

  const pipelineInputs = buildCliMainPipelineInputs(pipelineInputSources);
  const pipelineDependencies = buildCliMainPipelineDependencies(pipelineDependencySources);
  const { context, cliMainFlowDependencies } = buildCliMainFlowPipeline(args, {
    ...pipelineDependencies,
    ...pipelineInputs,
  });
  const flow = await executeCliMainFlow({
    context,
    ...cliMainFlowDependencies,
  });
  handleCliUsageExit(flow, {
    usage: pipelineInputSources.usage,
    stderr: pipelineInputSources.stderr,
    exit: pipelineInputSources.exit,
  });
}

module.exports = {
  executeCliMainExecution,
};
