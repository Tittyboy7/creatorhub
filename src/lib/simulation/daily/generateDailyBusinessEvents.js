import createSeededRandom from "../engine/createSeededRandom";

function didEventOccur(
  random,
  probability
) {
  return random() < probability;
}

function createEvent({
  id,
  type,
  label,
  description,
  impact = {},
  metadata = {},
}) {
  return {
    id,
    type,
    label,
    description,
    impact,
    metadata,
  };
}

function buildEventId({
  day,
  type,
}) {
  return `day-${day.dayIndex}-${type}`;
}

export default function generateDailyBusinessEvents({
  creator,
  dailyProfile,
  day,
}) {
  if (
    !creator ||
    !dailyProfile ||
    !day
  ) {
    return [];
  }

  const events = [];

  const seed =
    dailyProfile.seed || 1;

  const eventSeed =
    seed +
    day.dayIndex * 2027 +
    11003;

  const random =
    createSeededRandom(
      eventSeed
    );

  const behavior =
    dailyProfile.behavior || {};

  const probabilities =
    dailyProfile.events || {};

  /*
   * UPLOAD ACTIVITY
   *
   * Missing an upload is evaluated only
   * when an upload was actually scheduled.
   */
  if (day.scheduledUpload) {
    const missedUpload =
      didEventOccur(
        random,
        probabilities
          .missedUploadProbability || 0
      );

    if (missedUpload) {
      events.push(
        createEvent({
          id: buildEventId({
            day,
            type: "missed-upload",
          }),

          type: "missed_upload",

          label: "Missed Upload",

          description:
            "A scheduled YouTube upload was not published.",

          impact: {
            viewsMultiplier: 0.94,
            watchTimeMultiplier: 0.95,
            subscriberMultiplier: 0.96,
            revenueMultiplier: 0.97,
          },

          metadata: {
            scheduledUpload: true,
            published: false,
          },
        })
      );
    } else {
      events.push(
        createEvent({
          id: buildEventId({
            day,
            type: "content-published",
          }),

          type: "content_published",

          label: "Content Published",

          description:
            "A scheduled YouTube video was published.",

          impact: {
            viewsMultiplier: 1.08,
            watchTimeMultiplier: 1.07,
            subscriberMultiplier: 1.05,
            revenueMultiplier: 1.03,
          },

          metadata: {
            scheduledUpload: true,
            published: true,
          },
        })
      );

      /*
       * VIRAL OPPORTUNITY
       *
       * Viral behavior can only occur after
       * a successful scheduled publication.
       */
      const viralProbability =
        (probabilities
          .viralVideoProbability || 0) *
        (
          0.75 +
          (behavior.discoveryStrength ||
            0) *
            0.5
        );

      if (
        didEventOccur(
          random,
          viralProbability
        )
      ) {
        const viralStrength =
          1.75 +
          random() * 1.25;

        events.push(
          createEvent({
            id: buildEventId({
              day,
              type: "viral-video",
            }),

            type: "viral_video",

            label: "Viral Video",

            description:
              "Today's upload reached substantially more viewers than normal.",

            impact: {
              viewsMultiplier:
                viralStrength,

              watchTimeMultiplier:
                1.45 +
                random() * 0.55,

              subscriberMultiplier:
                1.7 +
                random() * 0.8,

              revenueMultiplier:
                1.25 +
                random() * 0.4,
            },

            metadata: {
              source:
                "scheduled-upload",
            },
          })
        );
      }
    }
  }

  /*
   * STREAM ACTIVITY
   *
   * For the first daily engine,
   * scheduled streams are assumed to occur.
   *
   * Stream cancellation/variation can become
   * its own behavior model later.
   */
  if (day.scheduledStream) {
    events.push(
      createEvent({
        id: buildEventId({
          day,
          type: "stream-completed",
        }),

        type: "stream_completed",

        label: "Stream Completed",

        description:
          "A scheduled livestream was completed.",

        impact: {
          viewsMultiplier: 1.025,
          watchTimeMultiplier: 1.12,
          subscriberMultiplier: 1.035,
          revenueMultiplier: 1.025,
        },

        metadata: {
          scheduledStream: true,
          completed: true,
        },
      })
    );
  }

  /*
   * SPONSORSHIP
   *
   * This probability is already converted
   * from weekly to daily in the daily profile.
   */
  if (
    didEventOccur(
      random,
      probabilities
        .sponsorshipProbability || 0
    )
  ) {
    const sponsorshipRevenue =
      Math.round(
        750 +
          random() * 1750
      );

    events.push(
      createEvent({
        id: buildEventId({
          day,
          type: "sponsorship",
        }),

        type: "sponsorship",

        label: "Sponsorship Completed",

        description:
          "A paid sponsorship was completed today.",

        impact: {
          sponsorshipRevenue,
        },
      })
    );
  }

  /*
   * MERCHANDISE ACTIVITY
   *
   * This remains a business-level event.
   * Later it can directly influence the
   * Shopify daily simulator.
   */
  if (
    didEventOccur(
      random,
      probabilities
        .merchandiseLaunchProbability ||
        0
    )
  ) {
    events.push(
      createEvent({
        id: buildEventId({
          day,
          type: "merchandise-launch",
        }),

        type: "merchandise_launch",

        label: "Merchandise Activity",

        description:
          "A merchandise launch or promotion occurred today.",

        impact: {
          commerceMultiplier:
            1.4 +
            random() * 0.5,

          revenueMultiplier:
            1.04 +
            random() * 0.06,
        },
      })
    );
  }

  return events;
}