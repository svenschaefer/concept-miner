const { processInput } = require("./core/processor");

function validateInputShape(input) {
  if (!input || typeof input !== "object") {
    throw new Error("runFromInput requires an object input.");
  }
  if (!Array.isArray(input.items)) {
    throw new Error("runFromInput input must include items[].");
  }
}

function runFromInput(input, options = {}) {
  validateInputShape(input);
  return processInput(input, options);
}

async function runMain(text, options = {}) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("runMain requires non-empty text.");
  }

  const input = {
    source_text: text,
    items: text
      .split(/\s+/)
      .filter(Boolean)
      .map((value, idx) => ({ id: `i:${idx + 1}`, value })),
  };

  return runFromInput(input, options);
}

module.exports = {
  runFromInput,
  runMain,
};
