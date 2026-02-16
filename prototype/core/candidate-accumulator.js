function createEmptyRoles() {
  return { actor: 0, theme: 0, attr: 0, topic: 0, location: 0, other: 0 };
}

function createCandidate(canonical) {
  return {
    canonical: String(canonical || ""),
    surfaces: new Set(),
    mention_ids: new Set(),
    assertion_ids: new Set(),
    roles: createEmptyRoles(),
  };
}

function ensureCandidate(byCanonical, canonical) {
  const key = String(canonical || "");
  if (!byCanonical.has(key)) {
    byCanonical.set(key, createCandidate(key));
  }
  return byCanonical.get(key);
}

function addRoleCounts(targetRoles, deltaRoles) {
  const target = targetRoles || createEmptyRoles();
  const delta = deltaRoles || {};
  target.actor += delta.actor || 0;
  target.theme += delta.theme || 0;
  target.attr += delta.attr || 0;
  target.topic += delta.topic || 0;
  target.location += delta.location || 0;
  target.other += delta.other || 0;
  return target;
}

function mergeCandidateIntoTarget(target, source) {
  for (const s of source.surfaces) target.surfaces.add(s);
  for (const m of source.mention_ids) target.mention_ids.add(m);
  for (const a of source.assertion_ids) target.assertion_ids.add(a);
  addRoleCounts(target.roles, source.roles);
}

module.exports = {
  ensureCandidate,
  addRoleCounts,
  mergeCandidateIntoTarget,
};
