function bindCliRuntimeInvocation({
  invokeCliRuntimeGeneration,
  generateForStep12Path,
  generateForSeed,
}) {
  return ({ seedId, step12In, runOptions }) =>
    invokeCliRuntimeGeneration({
      seedId,
      step12In,
      runOptions,
      generateForStep12Path,
      generateForSeed,
    });
}

module.exports = {
  bindCliRuntimeInvocation,
};
