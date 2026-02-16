function buildCliMainCatchDependencies(baseDependencies) {
  const { handleCliErrorExit, stderr, exit } = baseDependencies;
  return {
    handleCliErrorExit,
    stderr,
    exit,
  };
}

module.exports = {
  buildCliMainCatchDependencies,
};
