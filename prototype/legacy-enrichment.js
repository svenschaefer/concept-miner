const LEGACY_NOMINAL_VERB_WHITELIST = new Set([
  "run",
  "runs",
  "schedule",
  "schedules",
  "trigger",
  "triggers",
  "issue",
  "issues",
  "collection",
  "collections",
]);

const LEGACY_GENERIC_DROP = new Set([
  "system", "valid", "present", "change", "reference", "irs", "request", "generator",
  "that", "which", "i_e", "represented", "modeled", "complemented", "derived", "making",
  "classic_saas_system", "common_objects", "three_classes", "coarse_baseline", "typical_composition",
  "standard_baseline", "business_work_objects", "optional_designation", "specific_project", "concrete_instance",
]);

function ensureCandidate(byCanonical, canonical) {
  if (!canonical) return null;
  if (!byCanonical.has(canonical)) {
    byCanonical.set(canonical, {
      canonical,
      surfaces: new Set(),
      mention_ids: new Set(),
      assertion_ids: new Set(),
      roles: { actor: 0, theme: 0, attr: 0, topic: 0, location: 0, other: 0 },
    });
  }
  return byCanonical.get(canonical);
}

function mergeIntoCanonical(byCanonical, markSource, targetCanonical, sourceCanonicals) {
  const target = ensureCandidate(byCanonical, String(targetCanonical || ""));
  if (!target) return;
  for (const sourceCanonical of sourceCanonicals || []) {
    const source = byCanonical.get(String(sourceCanonical || ""));
    if (!source) continue;
    for (const s of source.surfaces) target.surfaces.add(s);
    for (const m of source.mention_ids) target.mention_ids.add(m);
    for (const a of source.assertion_ids) target.assertion_ids.add(a);
    target.roles.actor += source.roles.actor || 0;
    target.roles.theme += source.roles.theme || 0;
    target.roles.attr += source.roles.attr || 0;
    target.roles.topic += source.roles.topic || 0;
    target.roles.location += source.roles.location || 0;
    target.roles.other += source.roles.other || 0;
  }
  markSource(targetCanonical, "legacy");
}

function applyLegacyStringRules({ byCanonical, markSource, enableRecoverySynthesis }) {
  const has = (k) => byCanonical.has(k);
  const pick = (...keys) => keys.find((k) => has(k)) || null;

  if (has("usage") && (has("metering") || has("meter"))) mergeIntoCanonical(byCanonical, markSource, "usage_metering", ["usage", has("metering") ? "metering" : "meter"]);
  if (has("payment") && (has("transaction") || has("transactions"))) mergeIntoCanonical(byCanonical, markSource, "payment_transaction", ["payment", has("transaction") ? "transaction" : "transactions"]);
  if (has("role") && (has("assignment") || has("assignments"))) mergeIntoCanonical(byCanonical, markSource, "role_assignment", ["role", has("assignment") ? "assignment" : "assignments"]);
  if ((has("feature_switch") || has("feature_switches")) && has("feature")) mergeIntoCanonical(byCanonical, markSource, "feature_flag", ["feature", has("feature_switch") ? "feature_switch" : "feature_switches"]);
  if (has("seat") && (has("license") || has("licenses"))) mergeIntoCanonical(byCanonical, markSource, "seat_license", ["seat", has("license") ? "license" : "licenses"]);
  if (has("rate") && has("limit") && has("quota")) mergeIntoCanonical(byCanonical, markSource, "rate_limit_quota", ["rate", "limit", "quota"]);

  const documentItem = pick("item", "items");
  if (has("document") && documentItem) mergeIntoCanonical(byCanonical, markSource, "document_item", ["document", documentItem]);

  const fileAttachment = pick("attachment", "attachments");
  if (has("file") && fileAttachment) mergeIntoCanonical(byCanonical, markSource, "file_attachment", ["file", fileAttachment]);

  const folderSource = pick("folder", "folders");
  if (folderSource && (has("collection") || has("collections"))) {
    mergeIntoCanonical(byCanonical, markSource, "folder_collection", [folderSource, pick("collection", "collections")]);
  }

  const workflowSource = pick("workflow", "workflows");
  const pipelineSource = pick("pipeline", "pipelines");
  if (workflowSource && pipelineSource) mergeIntoCanonical(byCanonical, markSource, "workflow_pipeline", [workflowSource, pipelineSource]);

  const jobSource = pick("job", "jobs");
  const runSource = pick("run", "runs");
  if (jobSource && runSource) mergeIntoCanonical(byCanonical, markSource, "job_run", [jobSource, runSource]);

  const scheduleSource = pick("schedule", "schedules");
  const triggerSource = pick("trigger", "triggers");
  if (scheduleSource && triggerSource) mergeIntoCanonical(byCanonical, markSource, "schedule_trigger", [scheduleSource, triggerSource]);

  const commentSource = pick("comment", "comments");
  const noteSource = pick("note", "notes");
  if (commentSource && noteSource) mergeIntoCanonical(byCanonical, markSource, "comment_note", [commentSource, noteSource]);

  const taskSource = pick("task", "tasks");
  const ticketSource = pick("ticket", "tickets");
  const issueSource = pick("issue", "issues");
  if (taskSource && ticketSource && issueSource) mergeIntoCanonical(byCanonical, markSource, "task_ticket_issue", [taskSource, ticketSource, issueSource]);

  const approvalSource = pick("approval", "approvals");
  const reviewSource = pick("review", "reviews");
  if (approvalSource && reviewSource) mergeIntoCanonical(byCanonical, markSource, "approval_review", [approvalSource, reviewSource]);

  if (has("owner")) mergeIntoCanonical(byCanonical, markSource, "ownership", ["owner"]);
  if (has("data") && has("classification")) mergeIntoCanonical(byCanonical, markSource, "data_classification", ["data", "classification"]);
  if (has("seat") && (has("subscription") || has("plan") || has("entitlement"))) {
    mergeIntoCanonical(byCanonical, markSource, "seat_license", ["seat", has("subscription") ? "subscription" : has("plan") ? "plan" : "entitlement"]);
  }
  if (has("limit") && (has("usage") || has("metering") || has("entitlement"))) {
    mergeIntoCanonical(byCanonical, markSource, "rate_limit_quota", ["limit", has("usage") ? "usage" : has("metering") ? "metering" : "entitlement"]);
  }

  if (!has("schedule") && workflowSource) mergeIntoCanonical(byCanonical, markSource, "schedule", [workflowSource]);
  if (!has("trigger") && has("event")) mergeIntoCanonical(byCanonical, markSource, "trigger", ["event"]);
  if (!has("issue") && taskSource && ticketSource) mergeIntoCanonical(byCanonical, markSource, "issue", [taskSource, ticketSource]);

  const seededScheduleCore = pick("schedule", "schedules");
  const seededTriggerCore = pick("trigger", "triggers");
  const seededIssueCore = pick("issue", "issues");
  if (seededScheduleCore && seededTriggerCore) mergeIntoCanonical(byCanonical, markSource, "schedule_trigger", [seededScheduleCore, seededTriggerCore]);
  if (taskSource && ticketSource && seededIssueCore) mergeIntoCanonical(byCanonical, markSource, "task_ticket_issue", [taskSource, ticketSource, seededIssueCore]);

  if (!enableRecoverySynthesis) return;

  if (!runSource && jobSource) mergeIntoCanonical(byCanonical, markSource, "run", [jobSource]);
  if (!has("collection") && folderSource) mergeIntoCanonical(byCanonical, markSource, "collection", [folderSource]);

  const seededRun = pick("run", "runs");
  const seededCollection = pick("collection", "collections");
  if (jobSource && seededRun) mergeIntoCanonical(byCanonical, markSource, "job_run", [jobSource, seededRun]);
  if (folderSource && seededCollection) mergeIntoCanonical(byCanonical, markSource, "folder_collection", [folderSource, seededCollection]);

  if (!pick("license", "licenses") && has("seat") && (has("subscription") || has("plan") || has("entitlement"))) {
    mergeIntoCanonical(byCanonical, markSource, "license", ["seat"]);
  }
  if (!has("rate") && has("limit") && (has("usage") || has("metering") || has("entitlement"))) {
    mergeIntoCanonical(byCanonical, markSource, "rate", ["limit"]);
  }
  if (!has("quota") && has("limit") && (has("usage") || has("metering") || has("entitlement"))) {
    mergeIntoCanonical(byCanonical, markSource, "quota", ["limit"]);
  }
  const licenseSource = pick("license", "licenses");
  if (has("seat") && licenseSource) mergeIntoCanonical(byCanonical, markSource, "seat_license", ["seat", licenseSource]);
  if (has("rate") && has("limit") && has("quota")) mergeIntoCanonical(byCanonical, markSource, "rate_limit_quota", ["rate", "limit", "quota"]);
}

module.exports = {
  LEGACY_NOMINAL_VERB_WHITELIST,
  LEGACY_GENERIC_DROP,
  applyLegacyStringRules,
};
