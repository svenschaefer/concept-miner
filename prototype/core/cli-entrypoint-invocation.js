function invokeCliEntrypoint(runCliEntrypoint, requireMain, moduleObject, main) {
  return runCliEntrypoint(requireMain, moduleObject, main);
}

module.exports = {
  invokeCliEntrypoint,
};
