function buildCliParseDependencies(baseDependencies) {
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
  } = baseDependencies;

  return {
    env,
    arg,
    hasFlag,
    parseStepMode,
    parseNonNegativeNumberArg,
    step13Modes,
    defaultArtifactsRoot,
    defaultWikipediaTitleIndexEndpoint,
    parseCliExecutionContext,
  };
}

module.exports = {
  buildCliParseDependencies,
};
