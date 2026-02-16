function handleCliUsageExit(flow, dependencies) {
  if (!flow || !flow.usage) {
    return false;
  }
  const { usage, stderr, exit } = dependencies;
  stderr(usage());
  exit(2);
  return true;
}

module.exports = {
  handleCliUsageExit,
};
