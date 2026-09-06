function normalizeValues(values = []) {
  return values.filter(
    (value) =>
      typeof value === "number" &&
      Number.isFinite(value)
  );
}

function buildChartPoints(
  values,
  {
    width = 320,
    height = 130,
    paddingX = 8,
    paddingY = 14,
  } = {}
) {
  const safeValues = normalizeValues(values);

  if (safeValues.length === 0) {
    return [];
  }

  if (safeValues.length === 1) {
    return [
      {
        x: width / 2,
        y: height / 2,
        value: safeValues[0],
      },
    ];
  }

  const minimumValue = Math.min(...safeValues);
  const maximumValue = Math.max(...safeValues);

  const valueRange =
    maximumValue - minimumValue || 1;

  const usableWidth =
    width - paddingX * 2;

  const usableHeight =
    height - paddingY * 2;

  return safeValues.map((value, index) => {
    const progress =
      index / (safeValues.length - 1);

    const normalizedValue =
      (value - minimumValue) /
      valueRange;

    return {
      x:
        paddingX +
        usableWidth * progress,

      y:
        height -
        paddingY -
        usableHeight * normalizedValue,

      value,
    };
  });
}

function buildLinePath(points) {
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point.x} ${point.y}`
    )
    .join(" ");
}

function buildAreaPath(
  points,
  height = 130
) {
  if (points.length < 2) {
    return "";
  }

  const firstPoint =
    points[0];

  const lastPoint =
    points[points.length - 1];

  const linePath =
    buildLinePath(points);

  return `${linePath} L${lastPoint.x} ${
    height - 8
  } L${firstPoint.x} ${
    height - 8
  } Z`;
}

export default function PlatformTrendChart({
  values = [],
  accent = "violet",
  height = "h-32",
  strokeWidth = 2.5,
  showArea = true,
  className = "",
}) {
  const width = 320;
  const viewBoxHeight = 130;

  const points =
    buildChartPoints(values, {
      width,
      height: viewBoxHeight,
    });

  if (points.length === 0) {
    return (
      <div
        className={`flex ${height} items-center justify-center text-xs text-zinc-600 ${className}`}
      >
        Trend unavailable
      </div>
    );
  }

  const linePath =
    buildLinePath(points);

  const areaPath =
    buildAreaPath(
      points,
      viewBoxHeight
    );

  const accentClass =
    accent === "green"
      ? "text-green-400"
      : accent === "blue"
        ? "text-blue-400"
        : accent === "amber"
          ? "text-amber-400"
          : accent === "cyan"
            ? "text-cyan-400"
            : accent === "pink"
              ? "text-pink-400"
              : "text-violet-400";

  const gradientId =
    `platform-trend-${accent}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${viewBoxHeight}`}
      aria-hidden="true"
      className={`w-full ${height} ${accentClass} ${className}`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="currentColor"
            stopOpacity="0.28"
          />

          <stop
            offset="100%"
            stopColor="currentColor"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {showArea &&
      points.length > 1 ? (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
        />
      ) : null}

      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.length === 1 ? (
        <circle
          cx={points[0].x}
          cy={points[0].y}
          r="3"
          fill="currentColor"
        />
      ) : null}
    </svg>
  );
}