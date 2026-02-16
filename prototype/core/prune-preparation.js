function computeRoleTotal(item) {
  return (item.roles.actor || 0) +
    (item.roles.theme || 0) +
    (item.roles.attr || 0) +
    (item.roles.topic || 0) +
    (item.roles.location || 0) +
    (item.roles.other || 0);
}

function createPruneState(initialCanonicals, byCanonical) {
  const pluralSet = new Set(initialCanonicals);
  const roleTotalByCanonical = new Map();
  const partsByCanonical = new Map();
  const compoundsByComponent = new Map();
  const compoundsBySuffix = new Map();

  for (const canonical of initialCanonicals) {
    const item = byCanonical.get(canonical);
    if (!item) continue;
    const roleTotal = computeRoleTotal(item);
    roleTotalByCanonical.set(canonical, roleTotal);
    const parts = canonical.split("_").filter(Boolean);
    partsByCanonical.set(canonical, parts);
    if (parts.length >= 2) {
      const seenParts = new Set(parts);
      for (const p of seenParts) {
        if (!compoundsByComponent.has(p)) compoundsByComponent.set(p, new Set());
        compoundsByComponent.get(p).add(canonical);
      }
      for (let i = 1; i < parts.length; i += 1) {
        const suffix = parts.slice(i).join("_");
        if (!compoundsBySuffix.has(suffix)) compoundsBySuffix.set(suffix, new Set());
        compoundsBySuffix.get(suffix).add(canonical);
      }
    }
  }

  const activeCanonicals = new Set(initialCanonicals);
  const hasComponentInCompound = (canonical) => {
    const compounds = compoundsByComponent.get(canonical);
    if (!compounds) return false;
    for (const compound of compounds) {
      if (compound !== canonical && activeCanonicals.has(compound)) return true;
    }
    return false;
  };
  const deactivateCanonical = (canonical) => {
    if (!activeCanonicals.delete(canonical)) return;
    const parts = partsByCanonical.get(canonical) || [];
    if (parts.length >= 2) {
      const seenParts = new Set(parts);
      for (const p of seenParts) {
        const set = compoundsByComponent.get(p);
        if (set) {
          set.delete(canonical);
          if (set.size === 0) compoundsByComponent.delete(p);
        }
      }
      for (let i = 1; i < parts.length; i += 1) {
        const suffix = parts.slice(i).join("_");
        const set = compoundsBySuffix.get(suffix);
        if (set) {
          set.delete(canonical);
          if (set.size === 0) compoundsBySuffix.delete(suffix);
        }
      }
    }
  };

  return {
    pluralSet,
    roleTotalByCanonical,
    partsByCanonical,
    compoundsBySuffix,
    activeCanonicals,
    hasComponentInCompound,
    deactivateCanonical,
  };
}

module.exports = {
  createPruneState,
};
