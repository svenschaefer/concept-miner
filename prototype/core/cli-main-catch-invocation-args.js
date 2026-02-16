function buildCliMainCatchInvocationArgs(err, catchDependencies) {
  return [err, catchDependencies];
}

module.exports = {
  buildCliMainCatchInvocationArgs,
};
