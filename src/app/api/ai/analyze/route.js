import { NextResponse } from "next/server";

import {
  getAISkill,
  getRegisteredAISkillNames,
} from "@/lib/ai/skills/skillRegistry";

import {
  generateOpenAIResponse,
  getRealAIStatus,
} from "@/lib/ai/server/generateOpenAIResponse";

const SERVER_PROVIDERS = {
  MOCK: "server-mock",
  OPENAI: "openai",
};

function createErrorResponse({
  error,
  details = null,
  status = 400,
}) {
  return NextResponse.json(
    {
      ok: false,
      error,
      details,
    },
    { status }
  );
}

function normalizeProvider(provider) {
  return provider === SERVER_PROVIDERS.OPENAI
    ? SERVER_PROVIDERS.OPENAI
    : SERVER_PROVIDERS.MOCK;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const skillName =
      typeof body?.skillName === "string"
        ? body.skillName.trim()
        : "";

    const context = body?.context;

    const requestedProvider =
      normalizeProvider(body?.provider);

    if (!skillName) {
      return createErrorResponse({
        error: "An AI skill name is required.",
        details: {
          registeredSkills:
            getRegisteredAISkillNames(),
        },
      });
    }

    const skill = getAISkill(skillName);

    if (!skill) {
      return createErrorResponse({
        error: `The AI skill "${skillName}" is not registered.`,
        details: {
          requestedSkill: skillName,
          registeredSkills:
            getRegisteredAISkillNames(),
        },
        status: 404,
      });
    }

    const validation =
      skill.validateContext(context);

    if (!validation.isValid) {
      return createErrorResponse({
        error:
          "The AI context failed skill validation.",
        details: {
          skillName,
          validation,
        },
        status: 422,
      });
    }

    const systemPrompt =
      skill.buildSystemPrompt();

    const userPrompt =
      skill.buildUserPrompt(context);

    const promptPreview = {
      systemPrompt,
      userPrompt,
    };

    /*
     * Server mock remains the default path.
     * This branch cannot contact OpenAI.
     */
    if (
      requestedProvider ===
      SERVER_PROVIDERS.MOCK
    ) {
      return NextResponse.json({
        ok: true,

        provider: SERVER_PROVIDERS.MOCK,
        skillName,

        validation,
        promptPreview,

        response: {
          type:
            "mock-business-explanation",

          text:
            "The server successfully resolved the Business Brief skill, validated its context, and generated trusted prompts. No external AI provider was called.",
        },

        metadata: {
          requestedProvider,
          externalProviderCalled: false,
          paidRequestMade: false,

          systemPromptLength:
            systemPrompt.length,

          userPromptLength:
            userPrompt.length,

          registeredSkills:
            getRegisteredAISkillNames(),

          realAIStatus:
            getRealAIStatus(),
        },
      });
    }

    /*
     * A request reaches this branch only when the
     * caller explicitly requests provider: "openai".
     */
    const realAIStatus =
      getRealAIStatus();

    if (!realAIStatus.ready) {
      return createErrorResponse({
        error:
          "The OpenAI provider is not ready.",

        details: {
          requestedProvider,
          realAIStatus,

          requirements: {
            safetySwitch:
              "CREATORSHUB_REAL_AI_ENABLED=true",

            apiKey:
              "OPENAI_API_KEY must be configured.",
          },
        },

        status: 503,
      });
    }

    const openAIResult =
      await generateOpenAIResponse({
        systemPrompt,
        userPrompt,

        metadata: {
          skill_name: skillName,
          source:
            context?.source || "unknown",
        },
      });

    return NextResponse.json({
      ok: true,

      provider: SERVER_PROVIDERS.OPENAI,
      skillName,

      validation,
      promptPreview,

      response: {
        type:
          "openai-business-explanation",

        text: openAIResult.text,
      },

      model: openAIResult.model,
      usage: openAIResult.usage,
      durationMs:
        openAIResult.durationMs,

      metadata: {
        requestedProvider,

        externalProviderCalled:
          openAIResult.metadata
            .externalProviderCalled,

        paidRequestMade:
          openAIResult.metadata
            .paidRequestMade,

        storedByRequest:
          openAIResult.metadata
            .storedByRequest,

        responseId:
          openAIResult.responseId,

        systemPromptLength:
          systemPrompt.length,

        userPromptLength:
          userPrompt.length,

        registeredSkills:
          getRegisteredAISkillNames(),

        realAIStatus,
      },
    });
  } catch (error) {
    console.error(
      "AI analyze route error:",
      error
    );

    return createErrorResponse({
      error:
        "Failed to process the AI analysis request.",

      details:
        process.env.NODE_ENV ===
        "development"
          ? {
              message:
                error instanceof Error
                  ? error.message
                  : String(error),
            }
          : null,

      status: 500,
    });
  }
}