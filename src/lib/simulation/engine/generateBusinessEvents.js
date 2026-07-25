import createSeededRandom from "./createSeededRandom";

function didEventOccur(random, probability) {
  return random() < probability;
}

function createEvent({
  id,
  type,
  label,
  description,
  impact,
}) {
  return {
    id,
    type,
    label,
    description,
    impact,
  };
}

export default function generateBusinessEvents(
  creator,
  weekIndex = 1
) {
  const simulation = creator?.simulation;

  if (!simulation) {
    return [];
  }

  const creatorSeed = simulation.seed || 1;

  // A different salt from simulateWeek keeps event generation
  // deterministic without reusing the exact same random sequence.
  const eventSeed =
    creatorSeed + weekIndex * 2027;

  const random = createSeededRandom(eventSeed);

  const behavior = simulation.behavior || {};
  const probabilities =
    simulation.events || {};

  const events = [];

  const plannedUploads =
    creator?.business?.uploadFrequencyPerWeek || 0;

  const missedUpload = didEventOccur(
    random,
    probabilities.missedUploadProbability || 0
  );

  const uploadsPublished = missedUpload
    ? Math.max(0, plannedUploads - 1)
    : plannedUploads;

  if (uploadsPublished > 0) {
    events.push(
      createEvent({
        id: `week-${weekIndex}-uploads`,
        type: "content_published",
        label: "Content Published",
        description: `${uploadsPublished} YouTube ${
          uploadsPublished === 1 ? "video was" : "videos were"
        } published this week.`,
        impact: {
          viewsMultiplier:
            1 + uploadsPublished * 0.025,
          watchTimeMultiplier:
            1 + uploadsPublished * 0.02,
          subscriberMultiplier:
            1 + uploadsPublished * 0.015,
          revenueMultiplier:
            1 + uploadsPublished * 0.01,
        },
      })
    );
  }

  if (missedUpload) {
    events.push(
      createEvent({
        id: `week-${weekIndex}-missed-upload`,
        type: "missed_upload",
        label: "Missed Upload",
        description:
          "Alex published one fewer video than planned this week.",
        impact: {
          viewsMultiplier: 0.93,
          watchTimeMultiplier: 0.94,
          subscriberMultiplier: 0.95,
          revenueMultiplier: 0.96,
        },
      })
    );
  }

  const viralProbability =
    (probabilities.viralVideoProbability || 0) *
    (0.75 +
      (behavior.discoveryStrength || 0) * 0.5);

  if (
    uploadsPublished > 0 &&
    didEventOccur(random, viralProbability)
  ) {
    const viralStrength =
      1.75 + random() * 1.25;

    events.push(
      createEvent({
        id: `week-${weekIndex}-viral-video`,
        type: "viral_video",
        label: "Viral Video",
        description:
          "One of Alex’s uploads reached substantially more viewers than normal.",
        impact: {
          viewsMultiplier: viralStrength,
          watchTimeMultiplier:
            1.45 + random() * 0.55,
          subscriberMultiplier:
            1.7 + random() * 0.8,
          revenueMultiplier:
            1.25 + random() * 0.4,
        },
      })
    );
  }

  if (
    didEventOccur(
      random,
      probabilities.sponsorshipProbability || 0
    )
  ) {
    const sponsorshipRevenue =
      Math.round(750 + random() * 1750);

    events.push(
      createEvent({
        id: `week-${weekIndex}-sponsorship`,
        type: "sponsorship",
        label: "Sponsorship Secured",
        description:
          "Alex completed a paid sponsorship during this week.",
        impact: {
          sponsorshipRevenue,
        },
      })
    );
  }

  if (
    didEventOccur(
      random,
      probabilities.merchandiseLaunchProbability ||
        0
    )
  ) {
    events.push(
      createEvent({
        id: `week-${weekIndex}-merch-launch`,
        type: "merchandise_launch",
        label: "Merchandise Launch",
        description:
          "Alex launched or promoted a new merchandise product.",
        impact: {
          shopifyRevenueMultiplier:
            1.4 + random() * 0.5,
          revenueMultiplier:
            1.04 + random() * 0.06,
        },
      })
    );
  }

  return events;
}