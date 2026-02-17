function normalizeModeValue(mode) {
  if (mode === "generic_baseline" || mode === "generic-baseline") {
    return "generic-baseline";
  }
  if (mode === "default_extended" || mode === "default-extended") {
    return "default-extended";
  }
  return "default-extended";
}

module.exports = {
  normalizeModeValue,
};
