function handleCliMainCatch(err, dependencies) {
  const { handleCliErrorExit, stderr, exit } = dependencies;
  return handleCliErrorExit(err, {
    stderr,
    exit,
  });
}

module.exports = {
  handleCliMainCatch,
};
