function buildCliFlowDependencies(baseDependencies) {
  const { hasCliInputSource, handleCliResultIO } = baseDependencies;
  return {
    hasCliInputSource,
    handleCliResultIO,
  };
}

module.exports = {
  buildCliFlowDependencies,
};
