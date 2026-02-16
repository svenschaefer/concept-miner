function handleCliErrorExit(err, dependencies) {
  const { stderr, exit } = dependencies;
  stderr(err && err.message ? err.message : String(err));
  exit(1);
  return true;
}

module.exports = {
  handleCliErrorExit,
};
