function pushInvariantError(errors, pathValue, message, params = {}) {
  errors.push({
    message,
    path: pathValue,
    keyword: "invariant",
    params,
  });
}

function enforceConceptInvariants(doc, errors) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.concepts)) return;

  const seenIds = new Set();
  const seenNames = new Set();

  for (let i = 0; i < doc.concepts.length; i += 1) {
    const concept = doc.concepts[i];
    const id = typeof concept?.id === "string" ? concept.id : "";
    const name = typeof concept?.name === "string" ? concept.name : "";

    if (id) {
      if (seenIds.has(id)) {
        pushInvariantError(errors, `/concepts/${i}/id`, `Duplicate concept id: ${id}`, { duplicate: id });
      } else {
        seenIds.add(id);
      }
    }

    if (name) {
      if (seenNames.has(name)) {
        pushInvariantError(errors, `/concepts/${i}/name`, `Duplicate concept name: ${name}`, { duplicate: name });
      } else {
        seenNames.add(name);
      }
    }

    if (!Array.isArray(concept?.occurrences)) continue;
    for (let j = 0; j < concept.occurrences.length; j += 1) {
      const occurrence = concept.occurrences[j];
      if (!Number.isInteger(occurrence?.start) || !Number.isInteger(occurrence?.end)) continue;
      if (occurrence.end < occurrence.start) {
        pushInvariantError(
          errors,
          `/concepts/${i}/occurrences/${j}/end`,
          "Occurrence end must be greater than or equal to start.",
          { start: occurrence.start, end: occurrence.end }
        );
      }
    }
  }
}

module.exports = {
  enforceConceptInvariants,
};
