function runCliEntrypoint(requireMain, moduleObject, main) {
  if (requireMain === moduleObject) {
    main();
  }
}

module.exports = {
  runCliEntrypoint,
};
