function normalizeModeValue(mode) {
  if (mode === "generic_baseline" || mode === "generic-baseline") {
    return "generic_baseline";
  }
  if (mode === "default_extended" || mode === "default-extended") {
    return "default_extended";
  }
  return "default_extended";
}

module.exports = {
  normalizeModeValue,
};
