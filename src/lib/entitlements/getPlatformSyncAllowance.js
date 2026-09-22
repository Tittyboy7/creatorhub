import getCreatorEntitlements from "./getCreatorEntitlements";

function getStartOfCreatorDay({
  now = new Date(),
  timeZone = "UTC",
}) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  const parts =
    formatter.formatToParts(
      now
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  const creatorDate =
    `${year}-${month}-${day}`;

  const midnightFormatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  const probe =
    new Date(
      `${creatorDate}T12:00:00.000Z`
    );

  const probeParts =
    midnightFormatter
      .formatToParts(
        probe
      )
      .reduce(
        (result, part) => {
          if (
            part.type !==
            "literal"
          ) {
            result[
              part.type
            ] =
              part.value;
          }

          return result;
        },
        {}
      );

  const displayedAsUTC =
    Date.UTC(
      Number(
        probeParts.year
      ),
      Number(
        probeParts.month
      ) - 1,
      Number(
        probeParts.day
      ),
      Number(
        probeParts.hour
      ),
      Number(
        probeParts.minute
      ),
      Number(
        probeParts.second
      )
    );

  const offsetMs =
    displayedAsUTC -
    probe.getTime();

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      0,
      0,
      0
    ) -
      offsetMs
  );
}

function getNextCreatorDayStart({
  now = new Date(),
  timeZone = "UTC",
}) {
  const startOfDay =
    getStartOfCreatorDay({
      now,
      timeZone,
    });

  if (!startOfDay) {
    return null;
  }

  const tomorrowProbe =
    new Date(
      startOfDay.getTime() +
        36 * 60 * 60 * 1000
    );

  return getStartOfCreatorDay({
    now: tomorrowProbe,
    timeZone,
  });
}

export default async function getPlatformSyncAllowance({
  supabase,
  userId,
  planKey,
  timeZone = "UTC",
  now = new Date(),
}) {
  if (
    !supabase ||
    !userId
  ) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      remaining: 0,
      resetsAt: null,
      reason:
        "missing_context",
    };
  }

  const entitlements =
    getCreatorEntitlements({
      planKey,
    });

  const limit =
    entitlements
      .platformSync
      .manualSyncsPerDay;

  const startOfDay =
    getStartOfCreatorDay({
      now,
      timeZone,
    });

  const nextDayStart =
    getNextCreatorDayStart({
      now,
      timeZone,
    });

  if (
    !startOfDay ||
    !nextDayStart
  ) {
    return {
      allowed: false,
      used: 0,
      limit,
      remaining: 0,
      resetsAt: null,
      reason:
        "invalid_timezone",
    };
  }

  const {
    count,
    error,
  } =
    await supabase
      .from(
        "platform_sync_events"
      )
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "event_type",
        "manual_sync"
      )
      .gte(
        "created_at",
        startOfDay.toISOString()
      )
      .lt(
        "created_at",
        nextDayStart.toISOString()
      );

  if (error) {
    return {
      allowed: false,
      used: 0,
      limit,
      remaining: 0,
      resetsAt:
        nextDayStart.toISOString(),
      reason:
        "usage_lookup_failed",
      error:
        error.message,
    };
  }

  const used =
    count || 0;

  const remaining =
    Math.max(
      0,
      limit - used
    );

  return {
    allowed:
      remaining > 0,

    used,

    limit,

    remaining,

    resetsAt:
      nextDayStart.toISOString(),

    reason:
      remaining > 0
        ? null
        : "daily_limit_reached",

    planKey:
      entitlements.planKey,

    timeZone,
  };
}