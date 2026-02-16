function finalizeGeneratedOutput({
  outputDoc,
  seedDir,
  mode,
  step12Path,
  loadConceptCandidatesSchema,
  validateSchema,
  validateConceptCandidatesDeterminism,
  serializeDeterministicYaml,
}) {
  const diagnostics = outputDoc._diagnostics || null;
  if (outputDoc._diagnostics) delete outputDoc._diagnostics;
  const schema = loadConceptCandidatesSchema();
  validateSchema(schema, outputDoc);
  validateConceptCandidatesDeterminism(outputDoc);
  const yamlText = serializeDeterministicYaml(outputDoc);
  return {
    outputDoc,
    yamlText,
    seedDir,
    diagnostics,
    mode,
    ...(step12Path ? { step12Path } : {}),
  };
}

module.exports = {
  finalizeGeneratedOutput,
};
