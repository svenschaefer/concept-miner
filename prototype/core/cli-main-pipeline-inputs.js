function buildCliMainPipelineInputs(baseInputs) {
  const {
    env,
    arg,
    hasFlag,
    parseStepMode,
    parseNonNegativeNumberArg,
    step13Modes,
    defaultArtifactsRoot,
    defaultWikipediaTitleIndexEndpoint,
    parseCliExecutionContext,
    buildMetaSidecar,
    writePersistedOutputs,
    invokeCliRuntimeGeneration,
    generateForStep12Path,
    generateForSeed,
    hasCliInputSource,
    handleCliResultIO,
    parseCliMainExecutionContext,
    buildCliMainFlowContext,
    bindCliRuntimeInvocation,
    buildCliMainFlowDependencies,
    buildCliMainSetup,
  } = baseInputs;

  return {
    parseDependencyInputs: {
      env,
      arg,
      hasFlag,
      parseStepMode,
      parseNonNegativeNumberArg,
      step13Modes,
      defaultArtifactsRoot,
      defaultWikipediaTitleIndexEndpoint,
      parseCliExecutionContext,
    },
    flowContextDependencyInputs: {
      buildMetaSidecar,
      writePersistedOutputs,
    },
    runtimeInvocationDependencyInputs: {
      invokeCliRuntimeGeneration,
      generateForStep12Path,
      generateForSeed,
    },
    flowDependencyInputs: {
      hasCliInputSource,
      handleCliResultIO,
    },
    mainSetupCoreDependencies: {
      parseCliMainExecutionContext,
      buildCliMainFlowContext,
      bindCliRuntimeInvocation,
      buildCliMainFlowDependencies,
      buildCliMainSetup,
    },
  };
}

module.exports = {
  buildCliMainPipelineInputs,
};
