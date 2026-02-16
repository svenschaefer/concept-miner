async function invokeCliRuntimeGeneration({
  seedId,
  step12In,
  runOptions,
  generateForStep12Path,
  generateForSeed,
}) {
  if (step12In) {
    return generateForStep12Path(step12In, runOptions);
  }
  return generateForSeed(seedId, runOptions);
}

module.exports = {
  invokeCliRuntimeGeneration,
};
