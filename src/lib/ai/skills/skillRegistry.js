import buildBusinessBriefSystemPrompt from "./businessBrief/buildSystemPrompt";
import buildBusinessBriefUserPrompt from "./businessBrief/buildUserPrompt";
import validateBusinessBriefContext from "./businessBrief/validateContext";

export const AI_SKILL_NAMES = {
  BUSINESS_BRIEF: "business-brief",
  WIDGET_SNAPSHOT: "widget-snapshot",
};

const skillRegistry = {
  [AI_SKILL_NAMES.BUSINESS_BRIEF]: {
    name: AI_SKILL_NAMES.BUSINESS_BRIEF,

    validateContext:
      validateBusinessBriefContext,

    buildSystemPrompt:
      buildBusinessBriefSystemPrompt,

    buildUserPrompt:
      buildBusinessBriefUserPrompt,
  },
};

export function getAISkill(skillName) {
  if (!skillName) {
    return null;
  }

  return skillRegistry[skillName] || null;
}

export function hasAISkill(skillName) {
  return Boolean(getAISkill(skillName));
}

export function getRegisteredAISkillNames() {
  return Object.keys(skillRegistry);
}