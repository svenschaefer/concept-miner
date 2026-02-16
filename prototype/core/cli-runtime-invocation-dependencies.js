function buildCliRuntimeInvocationDependencies(baseDependencies) {
  const { invokeCliRuntimeGeneration, generateForStep12Path, generateForSeed } = baseDependencies;
  return {
    invokeCliRuntimeGeneration,
    generateForStep12Path,
    generateForSeed,
  };
}

module.exports = {
  buildCliRuntimeInvocationDependencies,
};
