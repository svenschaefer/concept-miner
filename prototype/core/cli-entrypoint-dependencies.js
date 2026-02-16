function buildCliEntrypointDependencies(baseDependencies) {
  const { runCliEntrypoint, requireMain, moduleObject, main } = baseDependencies;
  return {
    runCliEntrypoint,
    requireMain,
    moduleObject,
    main,
  };
}

module.exports = {
  buildCliEntrypointDependencies,
};
