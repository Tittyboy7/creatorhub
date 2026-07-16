# Business Intelligence Architecture

> The Business Intelligence Engine is the decision-making layer of CreatorsHub.

Platform integrations collect data.

The Business Intelligence Engine transforms that data into understanding.

The AI explains that understanding.

---

# Philosophy

CreatorsHub is not an analytics dashboard.

CreatorsHub is a Creator Operating System.

Every intelligence layer should help answer one or more questions:

1. What happened?

2. Why did it happen?

3. What should I do next?

The system should never expose raw platform complexity unless the creator asks for it.

Business understanding comes before AI.

---

# Intelligence Pipeline

Every provider follows this pipeline.

Platform APIs

↓

Connected Accounts

↓

Normalized Business Metrics

↓

Business Summary

↓

Business Signals

↓

Business Causes

↓

Business Intelligence

↓

Creator Brief

↓

Dashboard / Revenue / Compare / AI

Each layer has one responsibility.

No layer should duplicate another.

---

# Layer Responsibilities

## Connected Accounts

Purpose

Represent authenticated platform connections.

Owns

- OAuth
- Tokens
- Account identity
- Sync status
- Platform metadata

Does NOT

- Generate metrics
- Calculate trends
- Produce recommendations

---

## buildBusinessMetrics.js

Purpose

Normalize raw provider data into standardized metrics.

Input

- Connected account metadata
- Revenue entries
- Products
- Future platform records

Output

```js
Metric[]

Each metric contains

source
category
domain
metric
value
unit
date
metadata

Must NOT

Create summaries
Create signals
Create recommendations
Rank importance
buildBusinessSummary.js

Purpose

Summarize normalized metrics into one creator-business object.

Input

Metric[]

Output

BusinessSummary

Responsible for

Revenue totals
Audience totals
Commerce totals
Content totals
Community totals
Integration health
Data quality

Must NOT

Explain causes
Generate recommendations
Produce UI
buildBusinessSignals.js

Purpose

Detect meaningful business events.

Examples

Revenue declining
Revenue accelerating
Platform concentration
Audience momentum
Content inconsistency
Commerce slowdown

Input

BusinessSummary

Output

BusinessSignal[]

Each signal should contain

id
category
severity
title
reason
recommendation
action
metadata

Must NOT

Explain why
Rank business priorities beyond severity
Format UI
buildBusinessCauses.js

Purpose

Explain why signals probably occurred.

Input

BusinessSummary

BusinessSignals

Output

BusinessCause[]

Must

Link to signal IDs
Provide confidence
Distinguish primary vs supporting causes

Must NOT

Create recommendations
Produce UI
buildBusinessIntelligence.js

Purpose

Choose the highest-priority intelligence for the current page.

Input

Signals

Causes

Output

Headline

Summary

Recommendation

Priority

Action

This layer decides

"What matters most right now?"

buildCreatorBusinessBrief.js

Purpose

Convert intelligence into UI-ready data.

Input

Business Intelligence

Revenue Brief

Output

Dashboard Brief

This layer prepares information for presentation.

It does not calculate business logic.

Data Flow

Raw Platform Data

↓

Metrics

↓

Summary

↓

Signals

↓

Causes

↓

Intelligence

↓

Brief

↓

UI

The flow is one-directional.

Later layers should never modify earlier layers.

AI's Role

The LLM is not responsible for business analysis.

The LLM is responsible for communication.

CreatorsHub determines

What happened
Why it happened
What should happen next

The LLM explains those conclusions naturally.

The LLM should receive

Business Summary
Signals
Causes
Recommendations

The LLM should NOT receive

OAuth tokens
Customer information
Payment identifiers
Raw provider payloads
Personally identifiable information
Database implementation details
Business Domains

Revenue

Audience

Commerce

Content

Community

Sponsorships

Every intelligence system should operate on these domains rather than platform names.

Platforms are implementation details.

Business domains are product concepts.

Design Principles

Every layer should have one responsibility.

Business understanding comes before AI.

Platforms should disappear as early as possible.

Creators should understand their business, not their APIs.

Normalize once.

Reuse everywhere.

Summaries feed signals.

Signals feed causes.

Causes feed intelligence.

Intelligence feeds the UI.

The UI never recreates business logic.

Future Expansion

This architecture should support

Daily Brief
Revenue Intelligence
Audience Intelligence
Commerce Intelligence
Compare Workspace
Platform Intelligence
Forecasting
Business Health Score
AI Conversations

without requiring duplicated business logic.

Every future intelligence feature should extend this pipeline rather than creating a parallel system.

# Responsibility Map

## businessDomains.js

Purpose:

Define the canonical creator-business domains and map normalized metric keys into those domains.

Business domains:

- Revenue
- Audience
- Commerce
- Content
- Community
- Sponsorships

This file does not calculate metrics, summaries, signals, or recommendations.

---

## businessSystems.js

Purpose:

Group platforms by operational platform family.

Examples:

- Audience platforms: YouTube, Twitch, Kick
- Commerce platforms: Shopify, Fourthwall, Gumroad
- Membership platforms: Patreon
- Payment platforms: Stripe, PayPal
- Donation platforms: Streamlabs, StreamElements

Business systems organize integrations and filtering.

Business domains organize creator-business intelligence.

These concepts must remain separate.

---

## businessMetricsCatalog.js

Purpose:

Define recognized provider metrics, labels, units, and priorities.

The catalog describes which metrics a platform may provide.

It does not determine the final business domain by itself.

Provider metrics are mapped into business domains through `businessDomains.js`.

---

## buildBusinessMetrics.js

Purpose:

Normalize platform metadata, revenue entries, products, and future business records into standardized metrics.

Input:

- Revenue entries
- Connected account metadata
- Products
- Future provider data

Output:

```js
Metric[]