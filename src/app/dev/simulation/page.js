"use client";

import { useState } from "react";
import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildSimulationSnapshot from "@/lib/simulation/buildSimulationSnapshot";
import SimulationPlaygroundTabs from "@/components/dev/simulation/SimulationPlaygroundTabs";
import {
  AI_PROVIDERS,
  buildBusinessContext,
  callAIAnalyzeRoute,
  runBusinessBriefSkill,
} from "@/lib/ai";
const ALLOW_REAL_AI_TEST = false;

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Math.round(value || 0)
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatPercent(value) {
  const roundedValue = Math.round(value || 0);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function getEventStyle(type) {
  const styles = {
    content_published: {
      label: "Content",
      className:
        "border-blue-500/30 bg-blue-500/10 text-blue-200",
    },

    viral_video: {
      label: "Viral",
      className:
        "border-violet-500/30 bg-violet-500/10 text-violet-200",
    },

    sponsorship: {
      label: "Revenue",
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    },

    missed_upload: {
      label: "Warning",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-200",
    },

    merchandise_launch: {
      label: "Commerce",
      className:
        "border-pink-500/30 bg-pink-500/10 text-pink-200",
    },
  };

  return (
    styles[type] || {
      label: "Event",
      className:
        "border-zinc-700 bg-zinc-800 text-zinc-300",
    }
  );
}

function BusinessEventCard({
  event,
}) {
  const eventStyle = getEventStyle(event.type);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">
              {event.label}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${eventStyle.className}`}
            >
              {eventStyle.label}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {event.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function WeeklyEventGroup({
  week,
}) {
  const events = week.events || [];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Simulation Week
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Week {week.weekIndex}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
            {formatNumber(week.views)} views
          </span>

          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
            {formatCurrency(week.revenue)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <BusinessEventCard
              key={event.id}
              event={event}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">
              No notable business events were generated for this week.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function PeriodSummaryCard({
  label,
  period,
}) {
  if (!period) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        Weeks {period.startWeek}–{period.endWeek}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">
            Views
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatNumber(period.views)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">
            Watch Time
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatNumber(period.watchTimeHours)} hrs
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">
            Net Subscriber Growth
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            +{formatNumber(period.netSubscriberGrowth)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">
            Revenue
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatCurrency(period.revenue)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SimulationPlaygroundPage() {
  const [isRunningAI, setIsRunningAI] =
    useState(false);

  const [
    isRunningServerAI,
    setIsRunningServerAI,
  ] = useState(false);

  const [
    isRunningRealAI,
    setIsRunningRealAI,
  ] = useState(false);

  const [aiResult, setAIResult] =
    useState(null);

  const [aiError, setAIError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("overview");

  const isOverviewTab =
    activeTab === "overview";

  const isBusinessTab =
    activeTab === "business";

  const isPromptsTab =
    activeTab === "prompts";

  const isContextTab =
    activeTab === "context";

  const isRawTab =
    activeTab === "raw";

  const isAIResultTab =
    isPromptsTab ||
    isContextTab ||
    isRawTab;

  const simulation =
    buildSimulationSnapshot(gamingStreamer);

  const history = simulation?.history;
  const businessContext = simulation?.context;
  const businessBrief = simulation?.brief;

    async function handleRunMockAI() {
      if (
        !businessContext ||
        !businessBrief
      ) {
        setAIError(
          "Business intelligence is not available."
        );

        return;
      }
      
      setIsRunningAI(true);
      setAIError("");
      setAIResult(null);

      try {
        const result =
          await runBusinessBriefSkill({
            creator: gamingStreamer,

            businessIntelligence:
              businessContext,

            businessBrief,

            workspaceScope: {
              mode: "single-account",
              platform: "youtube",
              accountId:
                "youtube-alexplays-main",
              accountName: "Alex Plays",
              source: "simulation",
            },

            timeframe: {
              label: "Last 28 days",
              currentPeriod:
                simulation.currentPeriod,
              previousPeriod:
                simulation.previousPeriod,
            },

            provider:
              AI_PROVIDERS.MOCK,

            metadata: {
              environment: "development",
              page: "simulation-playground",
            },
          });

        setAIResult(result);
        setActiveTab("prompts");
      } catch (error) {
        console.error(
          "Business Brief mock AI test failed:",
            error
        );

        setAIError(
          error instanceof Error
            ? error.message
            : "The mock AI request failed."
        );
      } finally {
        setIsRunningAI(false);
      }
    }

  async function handleRunServerMockAI() {
    if (
      !businessContext ||
      !businessBrief
    ) {
      setAIError(
        "Business intelligence is not available."
      );

      return;
    }

    setIsRunningServerAI(true);
    setAIError("");
    setAIResult(null);

    const workspaceScope = {
      mode: "single-account",
      platform: "youtube",
      accountId:
        "youtube-alexplays-main",
      accountName: "Alex Plays",
      source: "simulation",
    };

    const timeframe = {
      label: "Last 28 days",
      currentPeriod:
        simulation.currentPeriod,
      previousPeriod:
        simulation.previousPeriod,
    };

    try {
      const context =
        buildBusinessContext({
          creator: gamingStreamer,

          businessIntelligence:
            businessContext,

          businessBrief,

          workspaceScope,
          timeframe,

          source:
            "simulation-playground-server-test",

          metadata: {
            environment: "development",
            page: "simulation-playground",
            testType: "server-mock",
          },
        });

      const routeResult =
        await callAIAnalyzeRoute({
          skillName: "business-brief",
          context,
          provider: "server-mock",
        });

      setAIResult({
        ...routeResult,

        /*
         * The API route intentionally does not echo the
         * complete context back. We attach the local copy
         * so the Context tab can still inspect it.
         */
        context,

        validation:
          routeResult?.validation || null,

        promptPreview:
          routeResult?.promptPreview || null,

        analysis: {
          headline:
            businessBrief.headline,

          whatHappened:
            businessBrief.whatHappened,

          whyItMatters:
            businessBrief.whyItMatters,

          nextAction:
            businessBrief.nextAction,

          confidence:
            businessBrief.confidence,
        },

        raw: routeResult,
      });

      setActiveTab("prompts");
    } catch (error) {
      console.error(
        "Business Brief server mock test failed:",
        error
      );

      setAIError(
        error instanceof Error
          ? error.message
          : "The server mock request failed."
      );
    } finally {
      setIsRunningServerAI(false);
    }
  }

  async function handleRunRealAI() {
    if (!ALLOW_REAL_AI_TEST) {
      setAIError(
        "Real AI testing is locked in the Simulation Playground."
      );

      return;
    }

    if (
      !businessContext ||
      !businessBrief
    ) {
      setAIError(
        "Business intelligence is not available."
      );

      return;
    }

    setIsRunningRealAI(true);
    setAIError("");
    setAIResult(null);

    const workspaceScope = {
      mode: "single-account",
      platform: "youtube",
      accountId:
        "youtube-alexplays-main",
      accountName: "Alex Plays",
      source: "simulation",
    };

    const timeframe = {
      label: "Last 28 days",
      currentPeriod:
        simulation.currentPeriod,
      previousPeriod:
        simulation.previousPeriod,
    };

    try {
      const context =
        buildBusinessContext({
          creator: gamingStreamer,

          businessIntelligence:
            businessContext,

          businessBrief,

          workspaceScope,
          timeframe,

          source:
            "simulation-playground-real-ai-test",

          metadata: {
            environment: "development",
            page: "simulation-playground",
            testType: "real-ai",
          },
        });

      const routeResult =
        await callAIAnalyzeRoute({
          skillName: "business-brief",
          context,
          provider: "openai",
        });

      setAIResult({
        ...routeResult,

        context,

        validation:
          routeResult?.validation || null,

        promptPreview:
          routeResult?.promptPreview || null,

        analysis: {
          headline:
            businessBrief.headline,

          whatHappened:
            businessBrief.whatHappened,

          whyItMatters:
            businessBrief.whyItMatters,

          nextAction:
            businessBrief.nextAction,

          confidence:
            businessBrief.confidence,
        },

        raw: routeResult,
      });

      setActiveTab("prompts");
    } catch (error) {
      console.error(
        "Business Brief real AI test failed:",
        error
      );

      const readiness =
        error?.details?.realAIStatus;

      if (readiness) {
        setAIError(
          `OpenAI is not ready. Safety switch: ${
            readiness.enabled
              ? "enabled"
              : "disabled"
          }. API key: ${
            readiness.configured
              ? "configured"
              : "missing"
          }.`
        );
      } else {
        setAIError(
          error instanceof Error
            ? error.message
            : "The real AI request failed."
        );
      }
    } finally {
      setIsRunningRealAI(false);
    }
  }

  if (
    !simulation ||
    !history ||
    !businessContext ||
    !businessBrief
  ) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <p>Unable to generate simulation history.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-violet-500/30 bg-zinc-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            CreatorsHub Development Tool
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Simulation Playground
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Inspect the simulated creator business before connecting generated
            data to CreatorsHub workspaces.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
              Creator: {gamingStreamer.profile.name}
            </span>

            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
              Type: {gamingStreamer.profile.creatorType}
            </span>

            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
              Seed: {gamingStreamer.simulation.seed}
            </span>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-stretch">
          <div className="min-w-0 flex-1">
            <SimulationPlaygroundTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasAIResult={Boolean(aiResult)}
            />
          </div>

          <div className="grid shrink-0 gap-2 sm:grid-cols-3 xl:w-[590px]">
            <button
              type="button"
              onClick={handleRunMockAI}
              disabled={
                isRunningAI ||
                isRunningServerAI ||
                isRunningRealAI
              }
              className="
                inline-flex
                min-h-14
                items-center
                justify-center
                rounded-3xl
                border
                border-violet-500/30
                bg-violet-500/10
                px-5
                py-3
                text-sm
                font-semibold
                text-violet-200
                transition
                hover:bg-violet-500/20
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isRunningAI
                ? "Running Local Mock..."
                : "Run Local Mock"}
            </button>

            <button
              type="button"
              onClick={handleRunServerMockAI}
              disabled={
                isRunningAI ||
                isRunningServerAI ||
                isRunningRealAI
              }
              className="
                inline-flex
                min-h-14
                items-center
                justify-center
                rounded-3xl
                border
                border-blue-500/30
                bg-blue-500/10
                px-5
                py-3
                text-sm
                font-semibold
                text-blue-200
                transition
                hover:bg-blue-500/20
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isRunningServerAI
                ? "Running Server Mock..."
                : "Run Server Mock"}
            </button>

            <button
              type="button"
              onClick={handleRunRealAI}
              disabled={
                !ALLOW_REAL_AI_TEST ||
                isRunningAI ||
                isRunningServerAI ||
                isRunningRealAI
              }
              title={
                ALLOW_REAL_AI_TEST
                  ? "Run a real OpenAI request"
                  : "Real AI testing is locked"
              }
              className="
                inline-flex
                min-h-14
                items-center
                justify-center
                rounded-3xl
                border
                border-emerald-500/20
                bg-emerald-500/5
                px-5
                py-3
                text-sm
                font-semibold
                text-emerald-200
                transition
                hover:bg-emerald-500/15
                hover:text-white
                disabled:cursor-not-allowed
                disabled:border-zinc-800
                disabled:bg-zinc-900
                disabled:text-zinc-600
                disabled:opacity-70
              "
            >
              {isRunningRealAI
                ? "Running Real AI..."
                : ALLOW_REAL_AI_TEST
                  ? "Run Real AI"
                  : "Real AI Locked"}
            </button>
          </div>
        </div>

      {isOverviewTab ? (
        <>
        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <PeriodSummaryCard
            label="Previous 28-Day Period"
            period={history.previousPeriod}
          />

          <PeriodSummaryCard
            label="Current 28-Day Period"
            period={history.currentPeriod}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Period Changes
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Business Signals
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Views
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {formatPercent(history.changes?.views)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Watch Time
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {formatPercent(
                  history.changes?.watchTimeHours
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Subscriber Growth
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {formatPercent(
                  history.changes?.netSubscriberGrowth
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Revenue
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {formatPercent(history.changes?.revenue)}
              </p>
            </div>
          </div>
        </section>

    {businessBrief ? (
      <section className="mt-6 overflow-hidden rounded-3xl border border-violet-500/30 bg-zinc-900">
        <div className="border-b border-zinc-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Creator Business Brief
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-white">
            {businessBrief.headline}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              {businessBrief.confidence.label}
            </span>

            <span className="text-sm text-zinc-500">
              {businessBrief.confidence.score}% confidence
            </span>
          </div>
        </div>

        <div className="grid gap-px bg-zinc-800 lg:grid-cols-3">
          <article className="bg-zinc-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              What happened?
            </p>

            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {businessBrief.whatHappened}
            </p>
          </article>

          <article className="bg-zinc-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Why does it matter?
            </p>

            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {businessBrief.whyItMatters}
            </p>
          </article>

          <article className="bg-zinc-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              What should I do next?
            </p>

            <p className="mt-3 font-semibold text-white">
              {businessBrief.nextAction.label}
            </p>

            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {businessBrief.nextAction.explanation}
            </p>

            <span className="mt-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-200">
              {businessBrief.nextAction.priority} priority
            </span>
          </article>
        </div>

        <div className="border-t border-zinc-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Supporting Evidence
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {businessBrief.evidence.map(
              (evidenceItem) => (
                <div
                  key={evidenceItem.label}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="text-sm text-zinc-500">
                    {evidenceItem.label}
                  </p>
                
                  <p className="mt-1 text-lg font-semibold text-white">
                    {evidenceItem.value}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    ) : null}
      </>
    ) : null}

      {isAIResultTab ? (
        <section className="mt-6 rounded-3xl border border-blue-500/30 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                AI Pipeline Test
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                Business Brief Skill
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Run the complete Business Brief AI pipeline through the mock provider.
                This test does not make a paid OpenAI request.
              </p>
          </div>

          {aiError ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="font-semibold text-red-200">
                AI test failed
              </p>

              <p className="mt-1 text-sm text-red-100/80">
                {aiError}
              </p>
            </div>
          ) : null}

          {aiResult ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {aiResult.ok ? "Success" : "Failed"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">
                    Provider
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {aiResult.provider || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">
                    Skill
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {aiResult.skillName || "business-brief"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">
                    Validation
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {aiResult.validation?.isValid
                      ? "Valid"
                      : "Invalid"}
                  </p>
                </div>
              </div>

              {aiResult.validation?.warnings?.length > 0 ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="font-semibold text-amber-200">
                    Validation warnings
                  </p>

                  <div className="mt-2 space-y-1">
                    {aiResult.validation.warnings.map(
                      (warning) => (
                        <p
                          key={warning}
                          className="text-sm text-amber-100/80"
                        >
                          {warning}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {isPromptsTab &&
              aiResult.promptPreview ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="min-w-0 rounded-2xl border border-violet-500/20 bg-zinc-950 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                      System Prompt
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Defines the Business Brief skill’s role, boundaries, and
                      response behavior.
                    </p>

                    <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-zinc-800 bg-black/20 p-4 text-xs leading-6 text-zinc-300">
                      {
                        aiResult.promptPreview
                          .systemPrompt
                      }
                    </pre>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-blue-500/20 bg-zinc-950 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                      User Prompt
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Contains the creator-specific business brief,
                      intelligence, goals, and supporting evidence.
                    </p>

                    <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-zinc-800 bg-black/20 p-4 text-xs leading-6 text-zinc-300">
                      {
                        aiResult.promptPreview
                          .userPrompt
                      }
                    </pre>
                  </div>
                </div>
              ) : null}

              {isContextTab ? (
                <div className="rounded-2xl border border-blue-500/20 bg-zinc-950 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                      AI Business Context
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      Context supplied to the skill
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                      This package contains the creator identity, selected workspace,
                      deterministic business intelligence, business brief, evidence, and
                      supporting metadata.
                    </p>
                  </div>

                  <pre className="mt-5 max-h-[680px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-zinc-800 bg-black/20 p-4 text-xs leading-6 text-zinc-300">
                    {JSON.stringify(
                      aiResult.context,
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}

            {isRawTab ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Raw Skill Response
                </p>

                <pre className="mt-4 max-h-[440px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-zinc-300">
                  {JSON.stringify(aiResult, null, 2)}
                </pre>
              </div>
            ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                No AI skill test has been run yet.
              </p>
            </div>
          )}
        </section>
      ) : null}

    {isBusinessTab ? (
      <>
        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Business Context
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              How CreatorsHub Understands This Business
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              This layer converts raw metrics into structured business understanding.
              It is the information the AI will eventually receive instead of raw data.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Momentum
              </p>

              <p className="mt-2 text-2xl font-semibold text-white capitalize">
                {businessContext.performance.momentum}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Primary Driver
              </p>

              <p className="mt-2 font-semibold text-white">
                {businessContext.primaryDriver.label}
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {businessContext.primaryDriver.explanation}
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <h3 className="font-semibold text-white">
                Current Risks
              </h3>

              <div className="mt-4 space-y-4">
                {businessContext.risks.map((risk) => (
                  <div key={risk.type}>
                    <p className="font-medium text-red-200">
                      {risk.label}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {risk.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="font-semibold text-white">
                Opportunities
              </h3>

              <div className="mt-4 space-y-4">
                {businessContext.opportunities.map(
                  (opportunity) => (
                    <div key={opportunity.type}>
                      <p className="font-medium text-emerald-200">
                        {opportunity.label}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        {opportunity.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

          </div>
        </section>

        <section className="mt-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Generated Events
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Business Event Timeline
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              These events explain why Alex’s performance changed from one
              simulated week to the next.
            </p>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {history.weeks.map((week) => (
              <WeeklyEventGroup
                key={week.weekIndex}
                week={week}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Generated History
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Weekly Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Week
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Views
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Watch Time
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Subscribers
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {history.weeks.map((week) => (
                  <tr
                    key={week.weekIndex}
                    className="text-zinc-300"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {week.weekIndex}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(week.views)}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(
                        week.watchTimeHours
                      )}{" "}
                      hrs
                    </td>

                    <td className="px-5 py-4">
                      +{formatNumber(
                        week.netSubscriberGrowth
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(week.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    ) : null}
      </div>
    </main>
  );
}