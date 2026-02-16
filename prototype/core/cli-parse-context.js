function parseCliMainExecutionContext(args, dependencies) {
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
  } = dependencies;
  return parseCliExecutionContext({
    args,
    env,
    arg,
    hasFlag,
    parseStepMode,
    parseNonNegativeNumberArg,
    step13Modes,
    defaultArtifactsRoot,
    defaultWikipediaTitleIndexEndpoint,
  });
}

module.exports = {
  parseCliMainExecutionContext,
};
