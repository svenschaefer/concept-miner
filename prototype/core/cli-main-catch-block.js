function handleCliMainCatchBlock(err, dependencies) {
  const {
    buildCliMainCatchDependencies,
    handleCliMainCatch,
    buildCliMainCatchInvocationArgs,
    catchDependencySources,
  } = dependencies;

  const catchDependencies = buildCliMainCatchDependencies(catchDependencySources);
  return handleCliMainCatch(...buildCliMainCatchInvocationArgs(err, catchDependencies));
}

module.exports = {
  handleCliMainCatchBlock,
};
