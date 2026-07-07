# Future Architecture Notes

**Status: none of this is built. This document exists so the architectural
thinking isn't lost — it replaced 18 empty directories (15 "service"/"worker"
folders plus 3 "package" folders) that contained only README files and zero
code. Those folders made the project look like a working microservices
platform in a directory listing; they weren't. This doc says the same things
honestly, in one place, clearly labeled as not-yet-built.**

The current, real architecture is a monolith: one Express backend, one
Postgres database, one FastAPI AI service — see the root `README.md` for
what's actually built and verified today.

If/when the platform outgrows the monolith, this is a reasonable direction
to decompose it in, service-by-service, each one built and verified on its
own before moving to the next (the same way every module in this project
has been built so far):

## Target service boundaries

| Service | Target role |
|---|---|
| `api-gateway` | North-south traffic entry point (e.g. Envoy Gateway / Kong) |
| `auth-service` | Identity, session, and authorization boundary |
| `issue-service` | Issue creation, media references, assignment, status transitions, audit history |
| `gis-service` | Spatial indexing (PostGIS), geofence enrichment, duplicate clustering, routing support |
| `ai-orchestrator` | Manages async AI job lifecycle/retries between `issue-service` and `ai-service` |
| `notification-service` | User-facing notifications across email/SMS/push |
| `realtime-service` | Authenticated WebSocket/SSE fan-out for live dashboards |
| `webhook-service` | Outbound event subscriptions, signed delivery, secret rotation |

## Target async workers

Each consumes a named event and does one job:

| Worker | Consumes | Does |
|---|---|---|
| `ingestion-worker` | `issue.submitted`, `media.ingest` | Validates uploads, extracts metadata, prepares AI requests |
| `ai-inference-worker` | `ai.inference.requested` | Calls `ai-service`, persists raw detections |
| `ai-postprocess-worker` | `ai.inference.completed` | Transforms raw detections into domain outputs |
| `geospatial-worker` | enrichment jobs | Calls `gis-service` for duplicate detection/boundary assignment |
| `projection-worker` | `projection.commands` | Refreshes read models for dashboards/feeds |
| `notification-dispatch-worker` | `notification.commands` | Delivers alerts through provider adapters |
| `webhook-delivery-worker` | `webhook.commands` | Signed outbound delivery with retry/dead-letter |

## Target shared packages

- **`contracts`** — REST request/response schemas shared across service boundaries
- **`events`** — event names, payload envelopes, retry metadata, dead-letter conventions
- **`telemetry`** — shared OpenTelemetry bootstrap/trace propagation for Node.js and Python services

## Why this isn't built yet, and what should happen before any of it is

Splitting a monolith into 8 services and 7 workers before the monolith has
even one fully-featured, well-tested domain module (issues) is the wrong
order of operations — it multiplies deployment/ops complexity long before
there's a scaling or team-boundary problem that justifies it. The honest
next step is finishing the **issues** module for real inside the existing
backend, verified the way the rest of this project has been (real tests,
real builds, real boots) — not scaffolding eight more empty services.
