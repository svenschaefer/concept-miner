function buildCliMainFlowDependencies({
  hasCliInputSource,
  invokeCliRuntimeGeneration,
  handleCliResultIO,
}) {
  return {
    hasCliInputSource,
    invokeCliRuntimeGeneration,
    handleCliResultIO,
  };
}

module.exports = {
  buildCliMainFlowDependencies,
};
