const fs = require("fs");
const path = require("path");
const { validateOutput } = require("../src/validate");

const fixturePath = path.resolve(__dirname, "../test/fixtures/example-output.json");

if (!fs.existsSync(fixturePath)) {
  throw new Error(`Fixture file not found: ${fixturePath}`);
}

const doc = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
validateOutput(doc);
process.stdout.write(
  `${JSON.stringify(
    {
      mode: "strict",
      validated_count: 1,
      fixture: fixturePath,
      ok: true,
    },
    null,
    2
  )}\n`
);
