const DEFAULT_MOMENTUM = {
  audience: 0.5,
  content: 0.5,
  revenue: 0.5,
  creator: 0.5,
  sponsorship: 0.25,
  commerce: 0.25,
};

const MOMENTUM_DECAY = {
  audience: 0.04,
  content: 0.05,
  revenue: 0.04,
  creator: 0.03,
  sponsorship: 0.08,
  commerce: 0.08,
};

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function applyDecay(
  value,
  targetValue,
  decayRate
) {
  return (
    value +
    (targetValue - value) * decayRate
  );
}

function getPreviousMomentum(previousState) {
  return {
    ...DEFAULT_MOMENTUM,
    ...(previousState?.momentum || {}),
  };
}

function buildBehaviorTarget(creator) {
  const behavior =
    creator?.simulation?.behavior || {};

  return {
    audience: clamp(
      0.35 +
        (behavior.audienceLoyalty || 0) * 0.2 +
        (behavior.discoveryStrength || 0) * 0.2
    ),

    content: clamp(
      0.3 +
        (behavior.uploadConsistency || 0) * 0.3 +
        (behavior.discoveryStrength || 0) * 0.15
    ),

    revenue: clamp(
      0.35 +
        (behavior.monetizationEfficiency || 0) * 0.4
    ),

    creator: clamp(
      0.3 +
        (behavior.communityStrength || 0) * 0.25 +
        (behavior.uploadConsistency || 0) * 0.2
    ),

    sponsorship: clamp(
      0.15 +
        (behavior.monetizationEfficiency || 0) * 0.3
    ),

    commerce: clamp(
      0.15 +
        (behavior.communityStrength || 0) * 0.15 +
        (behavior.monetizationEfficiency || 0) * 0.2
    ),
  };
}

function getEventMomentumImpact(event) {
  switch (event?.type) {
    case "content_published":
      return {};

    case "missed_upload":
      return {
        audience: -0.025,
        content: -0.08,
        revenue: -0.015,
        creator: -0.04,
      };

    case "viral_video":
      return {
        audience: 0.16,
        content: 0.18,
        revenue: 0.08,
        creator: 0.08,
      };

    case "sponsorship":
      return {
        revenue: 0.1,
        creator: 0.025,
        sponsorship: 0.24,
      };

    case "merchandise_launch":
      return {
        revenue: 0.055,
        creator: 0.02,
        commerce: 0.2,
      };

    default:
      return {};
  }
}

function combineEventImpacts(events = []) {
  return events.reduce(
    (combined, event) => {
      const impact =
        getEventMomentumImpact(event);

      return {
        audience:
          combined.audience +
          (impact.audience || 0),

        content:
          combined.content +
          (impact.content || 0),

        revenue:
          combined.revenue +
          (impact.revenue || 0),

        creator:
          combined.creator +
          (impact.creator || 0),

        sponsorship:
          combined.sponsorship +
          (impact.sponsorship || 0),

        commerce:
          combined.commerce +
          (impact.commerce || 0),
      };
    },
    {
      audience: 0,
      content: 0,
      revenue: 0,
      creator: 0,
      sponsorship: 0,
      commerce: 0,
    }
  );
}

function getMomentumDirection(
  currentValue,
  previousValue,
  threshold = 0.01
) {
  const difference =
    currentValue - previousValue;

  if (difference > threshold) {
    return "up";
  }

  if (difference < -threshold) {
    return "down";
  }

  return "steady";
}

function getMomentumLevel(value) {
  if (value >= 0.8) {
    return "very-high";
  }

  if (value >= 0.65) {
    return "high";
  }

  if (value >= 0.45) {
    return "stable";
  }

  if (value >= 0.3) {
    return "low";
  }

  return "very-low";
}

function buildMomentumDetails({
  current,
  previous,
}) {
  return Object.keys(current).reduce(
    (details, key) => {
      details[key] = {
        value: current[key],
        direction: getMomentumDirection(
          current[key],
          previous[key]
        ),
        level: getMomentumLevel(current[key]),
        change:
          current[key] - previous[key],
      };

      return details;
    },
    {}
  );
}

export default function buildMomentumState({
  creator,
  previousState = null,
  events = [],
}) {
  const previousMomentum =
    getPreviousMomentum(previousState);

  const behaviorTarget =
    buildBehaviorTarget(creator);

  const eventInfluence =
    combineEventImpacts(events);

  const momentum = Object.keys(
    DEFAULT_MOMENTUM
  ).reduce((nextMomentum, key) => {
  const decayedValue = applyDecay(
    previousMomentum[key],
    behaviorTarget[key],
    MOMENTUM_DECAY[key]
  );

  nextMomentum[key] = clamp(
    decayedValue +
      eventInfluence[key]
  );

    return nextMomentum;
  }, {});

  return {
    ...momentum,

    details: buildMomentumDetails({
      current: momentum,
      previous: previousMomentum,
    }),

    drivers: events.map((event) => ({
      id: event.id,
      type: event.type,
      label: event.label,
      description: event.description,
      impact: getEventMomentumImpact(event),
    })),
  };
}