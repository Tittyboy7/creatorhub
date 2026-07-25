import { BUSINESS_CONTEXT_VERSION } from "../types/businessContext";

function normalizeCreator(creator) {
  if (!creator) {
    return null;
  }

  return {
    id: creator.id ?? null,

    username:
      creator.username ??
      creator.profile?.username ??
      null,

    displayName:
      creator.display_name ??
      creator.displayName ??
      creator.profile?.name ??
      null,

    niche:
      creator.niche ??
      creator.profile?.niche ??
      null,

    creatorType:
      creator.creatorType ??
      creator.profile?.creatorType ??
      null,

    goals:
      creator.goals ??
      creator.business?.goals ??
      [],
  };
}

function normalizeWorkspaceScope(workspaceScope) {
  if (!workspaceScope) {
    return null;
  }

  return {
    mode:
      workspaceScope.mode ?? "single-account",

    platform:
      workspaceScope.platform ?? null,

    accountId:
      workspaceScope.accountId ?? null,

    accountIds:
      Array.isArray(workspaceScope.accountIds)
        ? workspaceScope.accountIds
        : [],

    accountName:
      workspaceScope.accountName ?? null,

    source:
      workspaceScope.source ?? null,
  };
}

export function buildBusinessContext({
  creator = null,
  widget = null,
  data = [],
  filters = {},
  timeframe = null,
  source = "compare-workspace",

  businessIntelligence = null,
  businessBrief = null,
  workspaceScope = null,

  metadata = {},
} = {}) {
  const safeData =
    Array.isArray(data) ? data : [];

  return {
    version: BUSINESS_CONTEXT_VERSION,
    source,
    generatedAt: new Date().toISOString(),

    creator: normalizeCreator(creator),

    workspaceScope:
      normalizeWorkspaceScope(
        workspaceScope
      ),

    widget: widget
      ? {
          id: widget.id ?? null,
          title: widget.title ?? null,
          type: widget.type ?? null,
          visualization:
            widget.visualization ?? null,
          platform:
            widget.platform ?? null,
          metric: widget.metric ?? null,
        }
      : null,

    filters,
    timeframe,

    intelligence: businessIntelligence
      ? {
          performance:
            businessIntelligence.performance ??
            null,

          activity:
            businessIntelligence.activity ??
            null,

          primaryDriver:
            businessIntelligence.primaryDriver ??
            null,

          risks:
            businessIntelligence.risks ?? [],

          opportunities:
            businessIntelligence.opportunities ??
            [],

          reportingPeriod:
            businessIntelligence.reportingPeriod ??
            null,

          evidence:
            businessIntelligence.evidence ??
            null,
        }
      : null,

    brief: businessBrief
      ? {
          headline:
            businessBrief.headline ?? null,

          whatHappened:
            businessBrief.whatHappened ?? null,

          whyItMatters:
            businessBrief.whyItMatters ?? null,

          nextAction:
            businessBrief.nextAction ?? null,

          confidence:
            businessBrief.confidence ?? null,

          evidence:
            businessBrief.evidence ?? [],
        }
      : null,

    dataSummary: {
      rowCount: safeData.length,
      hasData: safeData.length > 0,

      hasBusinessIntelligence:
        Boolean(businessIntelligence),

      hasBusinessBrief:
        Boolean(businessBrief),

      hasWorkspaceScope:
        Boolean(workspaceScope),
    },

    metadata,

    data: safeData,
  };
}