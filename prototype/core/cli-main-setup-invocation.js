function invokeCliMainSetup({ args, buildCliMainSetup, mainSetupDependencies }) {
  return buildCliMainSetup(args, mainSetupDependencies);
}

module.exports = {
  invokeCliMainSetup,
};
