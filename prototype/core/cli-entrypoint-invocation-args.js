function buildCliEntrypointInvocationArgs(dependencies) {
  const { runCliEntrypoint, requireMain, moduleObject, main } = dependencies;
  return [runCliEntrypoint, requireMain, moduleObject, main];
}

module.exports = {
  buildCliEntrypointInvocationArgs,
};
