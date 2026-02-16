const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

function resolveSeedTextInputPaths(artifactsRoot, seedId) {
  const legacySeedDir = path.join(artifactsRoot, seedId, "seed");
  const flatSeedDir = path.join(artifactsRoot, seedId);
  const legacySeedTextPath = path.join(legacySeedDir, "seed.txt");
  const flatSeedTextPath = path.join(flatSeedDir, "seed.txt");
  const seedDir = fs.existsSync(legacySeedTextPath) ? legacySeedDir : flatSeedDir;
  const seedTextPath = fs.existsSync(legacySeedTextPath) ? legacySeedTextPath : flatSeedTextPath;
  return {
    seedDir,
    seedTextPath,
    legacySeedTextPath,
    flatSeedTextPath,
  };
}

function loadStep12Yaml(step12Path) {
  const inputPath = path.resolve(step12Path);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing Step 12 artifact: ${inputPath}`);
  }
  const text = fs.readFileSync(inputPath, "utf8");
  const doc = YAML.parse(text);
  return { inputPath, doc };
}

module.exports = {
  resolveSeedTextInputPaths,
  loadStep12Yaml,
};
