import { buildBusinessContext } from "../context/buildBusinessContext";
import { runAIProvider } from "../providers/runAIProvider";

import validateBusinessBriefContext from "./businessBrief/validateContext";
import buildBusinessBriefSystemPrompt from "./businessBrief/buildSystemPrompt";
import buildBusinessBriefUserPrompt from "./businessBrief/buildUserPrompt";

export async function runBusinessBriefSkill({
  creator,
  businessIntelligence,
  businessBrief,
  workspaceScope = null,
  timeframe = null,
  provider,
  metadata = {},
} = {}) {
  const context = buildBusinessContext({
    creator,

    businessIntelligence,
    businessBrief,
    workspaceScope,

    timeframe,
    source: "business-brief-skill",

    metadata: {
      ...metadata,
      skillName: "business-brief",
    },
  });

  const validation =
    validateBusinessBriefContext(context);

  if (!validation.isValid) {
    return {
      ok: false,
      provider: null,
      skillName: "business-brief",

      context,
      validation,

      analysis: null,
      insights: [],

      raw: {
        error:
          "Business Brief context validation failed.",
      },
    };
  }

  const promptPreview = {
    systemPrompt:
      buildBusinessBriefSystemPrompt(),

    userPrompt:
      buildBusinessBriefUserPrompt(context),
  };

  const analysis = {
    headline:
      businessBrief?.headline ?? null,

    whatHappened:
      businessBrief?.whatHappened ?? null,

    whyItMatters:
      businessBrief?.whyItMatters ?? null,

    nextAction:
      businessBrief?.nextAction ?? null,

    confidence:
      businessBrief?.confidence ?? null,
  };

  const insights = [
    ...(businessIntelligence?.risks || []).map(
      (risk) => ({
        type: risk.type,
        category: "risk",
        severity: risk.severity,
        title: risk.label,
        description: risk.explanation,
      })
    ),

    ...(
      businessIntelligence?.opportunities || []
    ).map((opportunity) => ({
      type: opportunity.type,
      category: "opportunity",
      priority: opportunity.priority,
      title: opportunity.label,
      description: opportunity.explanation,
    })),
  ];

  const response = await runAIProvider({
    provider,
    skillName: "business-brief",
    context,
    analysis,
    insights,
  });

  return {
    ...response,

    ok: true,
    validation,
    promptPreview,
  };
}