# CreatorsHub Platform Metric Roadmap

> Living planning document for platform data, metric normalization,
> simulation coverage, Platform Hub support, and future Compare capabilities.

This document describes the CreatorsHub product as it is currently evolving.

It should be updated as:

- API capabilities are verified
- integrations are built
- simulator coverage expands
- product priorities change
- new platform metrics become useful
- CreatorsHub learns which information creators actually need

The older CreatorsHub architecture documentation may provide useful historical
context, but this roadmap should follow the product we are actually building.

---

# Product Direction

## Platforms

The Platforms page is the creator's platform command center.

Its purpose is to answer:

> What is happening across all of my connected platforms?

The default experience should remain simple.

Each connected platform card should provide:

- platform identity
- connection / sync health
- four useful metrics
- creator-customizable metric selection when enough metrics are available
- a compact interactive trend
- a small supporting summary
- access to the deeper platform workspace

Platforms should not become the primary custom-chart workspace.

---

## Compare

Compare will eventually become CreatorsHub's customizable analysis workspace.

Potential capabilities include:

- choose one or more platforms
- choose metrics
- choose date ranges
- create charts
- compare metrics
- compare platforms
- apply useful breakdowns / dimensions
- save charts
- revisit saved analyses
- potentially reuse or pin saved visualizations elsewhere

The exact UX will be designed later.

The metric architecture should support this future without forcing Compare's
complexity onto the Platforms page.

---

# Metric Priority System

## P0 — Launch Core

Metrics required for the default CreatorsHub experience.

These should generally:

- be reliable
- be understandable
- provide immediate creator value
- support important launch surfaces

---

## P1 — Launch Depth / Customization

Useful metrics that creators may choose for:

- customized Platform Hub cards
- Compare charts
- deeper platform analysis

They do not need to appear by default.

---

## P2 — Intelligence Inputs

Metrics primarily useful for:

- recommendations
- opportunities
- risks
- business health
- deeper analysis
- derived metrics

These may operate behind the scenes even when they are not prominently displayed.

---

## P3 — Expansion

Useful future metrics that should not delay launch.

---

# Data Acquisition Modes

Every normalized metric should eventually identify how CreatorsHub obtains it.

## historical-query

The provider can return historical measurements for requested periods.

Example:

YouTube Analytics views by day.

---

## snapshot

The provider primarily exposes the current state.

CreatorsHub may need to save snapshots over time to construct history.

---

## event-stream

The provider sends events as activity occurs.

Example:

Twitch EventSub subscription events.

---

## accumulated

CreatorsHub builds historical data after an account is connected by storing
snapshots or events over time.

---

## derived

CreatorsHub calculates the metric from one or more underlying measurements.

Examples:

- net subscriber growth
- revenue diversity
- revenue concentration
- cross-platform business health

---

# History Rules

A metric should also eventually record:

- whether historical data is immediately available
- maximum backfill period
- whether CreatorsHub must accumulate history
- required permissions / scopes
- whether monetization access is required
- whether the metric is account-level, content-level, or both

The UI should never invent unavailable historical data.

---

# YouTube

## Current CreatorsHub Status

Stage 2 simulation:

- implemented

Platform Hub:

- implemented

Interactive historical chart:

- implemented

History behavior:

- calendar-based

Current default Hub metrics:

1. Views
2. Subscribers
3. Revenue
4. Watch Time

---

## P0 — Launch Core

### Views

CreatorsHub key:

`views`

Acquisition:

`historical-query`

Simulator:

Implemented

Platform Hub:

Implemented

Compare:

Future

Notes:

Core YouTube Analytics metric.

---

### Net Subscriber Growth

CreatorsHub key:

`subscribers`

Underlying provider metrics:

- subscribersGained
- subscribersLost

CreatorsHub calculation:

`subscribersGained - subscribersLost`

Acquisition:

`historical-query + derived`

Simulator:

Implemented

Platform Hub:

Implemented

Compare:

Future

---

### Watch Time

CreatorsHub key:

`watchTime`

Provider metric:

`estimatedMinutesWatched`

CreatorsHub display may normalize this into hours.

Acquisition:

`historical-query`

Simulator:

Implemented

Platform Hub:

Implemented

Compare:

Future

---

### Estimated Revenue

CreatorsHub key:

`revenue`

Provider metric:

`estimatedRevenue`

Acquisition:

`historical-query`

Simulator:

Implemented

Platform Hub:

Implemented

Compare:

Future

Important:

Revenue availability and permissions must be treated separately from ordinary
audience metrics.

Estimated revenue may also be subject to later adjustments.

---

# YouTube P1 — Launch Depth / Customization

Candidate metrics:

- Average View Duration
- Average View Percentage
- Likes
- Comments
- Shares
- Engaged Views
- Subscribers Gained
- Subscribers Lost

These should become Platform Hub customization candidates only when CreatorsHub
has valid historical data for them.

They are also strong Compare candidates.

---

# YouTube P2 — Intelligence / Deeper Analysis

Candidate measurements and dimensions:

- audience retention
- video-level performance
- geography
- traffic / playback context
- device
- content type
- subscribed status
- playlist performance
- ad impressions
- monetized playbacks
- CPM
- estimated ad revenue
- YouTube Premium revenue

These do not all need to become Platform Hub metrics.

Many are better suited to:

- platform workspace
- Compare
- revenue intelligence
- audience intelligence
- recommendation systems

---

# YouTube Simulator Coverage

Currently simulated:

- Views
- Net subscriber growth
- Watch time
- Estimated YouTube revenue
- Average view duration
- publishing activity
- viral-video events
- missed-upload events
- sponsorship events
- merchandise events
- 365-day daily history

Future simulator candidates should be added only when they are needed for
product development or internal consistency.

The simulator does not need to reproduce every YouTube API field.

---

# Twitch

## Current CreatorsHub Status

Stage 2 simulation:

- implemented

Platform Hub:

- implemented

Interactive historical chart:

- implemented

History behavior:

- activity-only for stream metrics

Current default Hub metrics:

1. Average Viewers
2. Followers
3. Subs
4. Revenue

Additional registered metrics:

- Peak Viewers
- Unique Viewers
- Hours Streamed

---

# Twitch Data Model

Twitch should not be treated as if it behaves exactly like YouTube Analytics.

CreatorsHub may obtain Twitch information through combinations of:

- Twitch API resources
- EventSub
- current-state observations
- CreatorsHub-owned accumulated history

Some historical series may become richer the longer a creator remains
connected to CreatorsHub.

---

# Twitch P0 — Launch Core

### Average Viewers

CreatorsHub key:

`averageViewers`

Simulator:

Implemented

Platform Hub:

Implemented

History:

Activity-only

Important:

No-stream days are not zero-viewer streams.

---

### Followers Gained

CreatorsHub key:

`followers`

Simulator:

Implemented

Platform Hub:

Implemented

Potential real acquisition:

API / EventSub / accumulated CreatorsHub history

---

### Subscriptions

CreatorsHub key:

`subscriptions`

Simulator:

Implemented

Platform Hub:

Implemented

Important:

Current simulator subscriptions represent subscriptions generated during
simulated stream activity.

This should not automatically be interpreted as total active subscriptions.

---

### Stream Activity / Hours Streamed

CreatorsHub key:

`hoursStreamed`

Simulator:

Implemented

Metric registry:

Implemented

Platform Hub default:

No

Customization candidate:

Yes

---

# Twitch P1 — Launch Depth / Customization

Candidate metrics / events:

- Peak Viewers
- Unique Viewers
- Hours Streamed
- Gifted Subscriptions
- Cheers / Bits
- Stream Count

Potential Compare candidates:

- Average Viewers
- Peak Viewers
- Followers Gained
- Subscriptions
- Revenue-related signals
- Hours Streamed
- Stream Count

---

# Twitch P2 — Intelligence / Community

Potential signals:

- raids
- subscription endings
- subscriber churn
- resubscriptions
- chat activity
- stream consistency
- community activity
- gifted-sub behavior

These may become more valuable as intelligence inputs than as default Platform
Hub metrics.

---

# Twitch Revenue Important Distinction

The current Twitch simulator contains a synthetic Twitch revenue metric for
product-development purposes.

The real CreatorsHub integration should not assume that Twitch provides one
convenient historical revenue stream identical to the simulator.

Real creator revenue may be assembled from multiple sources/signals.

Examples may include:

- subscriptions
- gifted subscriptions
- Bits / cheers
- other supported Twitch monetization data

External tips / donations should remain separate integrations when they come
from providers such as:

- Streamlabs
- StreamElements
- PayPal
- other payment providers

CreatorsHub should normalize these into business revenue without pretending
they originated from Twitch itself.

---

# Twitch Simulator Coverage

Currently simulated:

- scheduled stream days
- stream duration
- average concurrent viewers
- peak concurrent viewers
- unique viewers
- followers gained
- subscriptions
- Twitch revenue
- stream-to-stream carryover
- 365-day history

The baseline has been validated against the fictional creator's reference
28-day Twitch period.

Future simulator candidates:

- gifted subs
- Bits / cheers
- raids
- missed streams
- breakout streams
- collaborations
- chat activity
- explicit Twitch growth
- cross-platform audience effects

These should be added when required by product development rather than all at
once.

---

# Shopify

## Current CreatorsHub Status

Stage 2 simulation:

- partially implemented

Platform Hub:

- still fixture-backed

Interactive historical chart:

- not yet connected

Existing Stage 2 simulator metrics:

- Sessions
- Conversion Rate
- Orders
- Units Sold
- Units Per Order
- Average Order Value
- Gross Sales

---

# Shopify P0 — Launch Core

Recommended default Hub metrics:

1. Orders
2. Sales
3. Products / Units Sold
4. Conversion Rate

These closely match the current Platform Hub design and provide a useful
commerce snapshot.

---

### Orders

Acquisition:

Shopify analytics / records

Simulator:

Implemented

Platform Hub:

Fixture currently

---

### Sales

Potential normalized CreatorsHub metric:

`totalSales` or another explicitly defined sales metric

Important:

CreatorsHub must distinguish concepts such as:

- gross sales
- net sales
- total sales

rather than using the word "sales" ambiguously.

Simulator currently models:

`grossSales`

---

### Units Sold

Simulator:

Implemented

Potential provider measures include ordered/sold quantities.

Platform Hub:

Fixture currently

---

### Conversion Rate

Simulator:

Implemented

Platform Hub:

Fixture currently

Important:

CreatorsHub should explicitly document the denominator/source used for its
conversion-rate definition.

---

# Shopify P1 — Launch Depth / Customization

Strong candidates:

- Average Order Value
- Customers
- New Customers
- Returning Customers
- Returning Customer Rate
- Gross Sales
- Net Sales
- Returns
- Return Rate
- Orders from First-Time Customers
- Orders from Returning Customers

---

# Shopify P2 — Intelligence / Compare

Strong candidates:

- product-level sales
- product rankings
- sales by channel
- new vs returning customer revenue
- discount performance
- return reasons
- profitability metrics when cost data is available
- customer cohorts
- inventory signals

ShopifyQL is especially valuable for future Compare functionality because it
supports analytical metrics, dimensions, time series, grouping, filtering,
ranking, and period comparisons.

---

# Shopify Historical Considerations

CreatorsHub should distinguish:

1. analytics access
2. raw order-record access

Raw order access can have historical-access restrictions.

The integration layer should record:

- what can be backfilled
- what requires additional access
- what CreatorsHub must accumulate itself

---

# Shopify Simulator Expansion

Current simulator already provides enough core commerce behavior to begin
replacing the green Platform Hub fixture.

Before adding more Shopify simulation metrics, CreatorsHub should first connect
the existing Stage 2 commerce data to the Hub and validate it.

Likely later additions:

- returns
- customers
- new vs returning customers
- net sales
- discounts
- product-level performance

---

# Platform Hub Metric Rules

Each platform should eventually support:

- a platform-specific metric catalog
- default metric selections
- creator-selected metric preferences
- metric availability checks
- metric formatting
- history behavior
- historical chart support when appropriate

Creators should eventually be able to choose four supported metrics for each
platform card.

A metric should not be offered when CreatorsHub lacks sufficient data to
support it properly.

---

# History Modes

## calendar

Used when every calendar day represents a valid observation.

Current example:

YouTube Views.

---

## activity-only

Used when a metric only exists when a relevant activity occurs.

Current example:

Twitch Average Viewers.

No-stream days should not be interpreted as streams with zero viewers.

---

# Compare Roadmap

Compare is planned as the deeper customizable chart and analysis workspace.

Potential future workflow:

1. Choose platform or business data source.
2. Choose one or more metrics.
3. Choose a date range.
4. Choose a useful visualization.
5. Apply available breakdowns or dimensions.
6. Compare results.
7. Save the chart / analysis.

Possible later capabilities:

- saved charts
- reusable chart templates
- cross-platform comparisons
- platform vs business metrics
- period-over-period comparisons
- content-level comparisons
- product-level comparisons
- audience breakdowns
- revenue breakdowns

The Compare redesign should be planned separately from the Platform Hub.

---

# Normalization Principles

CreatorsHub should not simply expose provider field names.

Provider data should be normalized into clear CreatorsHub concepts.

Examples:

YouTube:

`estimatedMinutesWatched`

may become:

`watchTimeHours`

Twitch:

subscription events may contribute to:

`subscriptions`

Shopify:

provider sales metrics should map to explicitly named concepts such as:

`grossSales`

`netSales`

`totalSales`

Normalization must preserve important semantic differences.

---

# Cross-Platform Metrics

Some of CreatorsHub's most valuable metrics will not exist in any single API.

They will be derived by CreatorsHub.

Future examples:

- Total Creator Revenue
- Revenue by Source
- Revenue Concentration
- Revenue Diversity
- Cross-Platform Audience Growth
- Business Health
- Platform Dependence
- Revenue per Audience Member
- Commerce Conversion from Audience Growth
- Sponsorship Dependence

These should be treated as CreatorsHub business metrics rather than provider
metrics.

---

# Simulator Philosophy

The simulator exists to support product development.

It should:

- create internally consistent creator histories
- exercise the UI
- exercise intelligence systems
- expose edge cases
- model realistic business relationships
- support development before real APIs are connected

The simulator does not need to recreate every field exposed by every provider.

New simulated metrics should be added when:

1. the product needs them
2. another simulated metric depends on them
3. they are required to validate an important business relationship

---

# Current Implementation Checkpoint

## YouTube

Stage 2 simulator:

Complete enough for current Platform Hub development.

Platform Hub:

Simulation-backed.

---

## Twitch

Stage 2 simulator:

Complete enough for current Platform Hub development.

Platform Hub:

Simulation-backed.

---

## Shopify

Stage 2 simulator:

Core commerce model already exists.

Platform Hub:

Fixture-backed.

Recommended next engineering target:

Connect existing Stage 2 Shopify commerce data to the Platform Hub before
expanding Shopify simulation breadth.

---

# Next Integration Research

After the initial YouTube / Twitch / Shopify foundation is stable, research:

## Patreon

Focus:

- memberships
- recurring revenue
- membership tiers
- churn / retention
- member growth

## Stripe

Focus:

- payments
- subscriptions
- refunds
- fees
- payouts
- net revenue

## PayPal

Focus:

- payments
- refunds
- fees
- creator income

## Streamlabs / StreamElements

Focus:

- tips / donations
- supporter activity
- streaming revenue signals

These integrations should use the same acquisition, normalization, priority,
and product-surface framework defined in this document.

---

# Roadmap Rule

API availability does not automatically make a metric a CreatorsHub feature.

For every candidate metric, ask:

1. Is it reliable?
2. Is it understandable?
3. Does it help a creator make a better decision?
4. Is it useful as a default, customization option, Compare metric, or
   intelligence input?
5. Is its history actually available?
6. Does CreatorsHub need to accumulate that history?
7. Is another normalized metric already expressing the same concept?

Support depth where it creates value.

Do not create complexity simply because an API makes more data available.