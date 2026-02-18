function normalizeModeValue(mode) {
  if (mode === undefined || mode === null || mode === "") {
    return "default-extended";
  }
  if (mode === "generic-baseline") {
    return "generic-baseline";
  }
  if (mode === "default-extended") {
    return "default-extended";
  }
  const err = new Error("Invalid mode. Expected 'generic-baseline' or 'default-extended'.");
  err.code = "INVALID_MODE";
  throw err;
}

module.exports = {
  normalizeModeValue,
};
