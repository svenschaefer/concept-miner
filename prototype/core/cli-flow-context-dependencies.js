function buildCliFlowContextDependencies(baseDependencies) {
  const { buildMetaSidecar, writePersistedOutputs } = baseDependencies;
  return {
    buildMetaSidecar,
    writePersistedOutputs,
  };
}

module.exports = {
  buildCliFlowContextDependencies,
};
