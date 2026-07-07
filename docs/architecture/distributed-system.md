# CivicVision Distributed System Architecture

## Goal

Design CivicVision as a distributed system that can ingest civic issue reports, process AI detection workloads asynchronously, fan out notifications, stream status updates in real time, and scale across regions without turning the repo into a collection of unrelated technologies.

## Current To Target Mapping

- `apps/frontend` remains the web client.
- `apps/backend` is the current combined API and should be treated as the transitional source for `auth-service` and `issue-service`.
- `apps/ai-service` remains the Python inference service.
- New service folders represent the target steady-state architecture, not a fully implemented split today.

## Services

| Service | Runtime | Responsibility | Primary Data |
| --- | --- | --- | --- |
| `api-gateway` | Envoy or Kong | North-south entry point, routing, auth enforcement, rate limiting, request shaping | No system-of-record data |
| `auth-service` | Node.js + TypeScript | Users, sessions, roles, refresh tokens, municipal SSO/OIDC | Auth database |
| `issue-service` | Node.js + TypeScript | Issue lifecycle, uploads, assignments, audit trail, public/admin APIs | Issue database |
| `ai-orchestrator` | Node.js + TypeScript | AI job state machine, retries, human-review handoff, inference coordination | AI job database |
| `ai-service` | Python + FastAPI | Model inference, image validation, model health, detection outputs | Model metadata cache only |
| `gis-service` | Node.js + TypeScript | Geospatial search, geofence checks, duplicate clustering, routing inputs | PostGIS database |
| `notification-service` | Node.js + TypeScript | Email, SMS, push, user preferences, campaign safety rules | Notification database |
| `realtime-service` | Node.js + TypeScript | WebSocket and SSE fan-out for live dashboards and status updates | Redis presence state |
| `webhook-service` | Node.js + TypeScript | Outbound event delivery, retries, signature generation, subscription management | Webhook database |

## Workers

- `ingestion-worker`: validates uploads, extracts metadata, writes initial object references, and publishes the first processing event.
- `ai-inference-worker`: consumes AI jobs, calls `ai-service`, stores raw detections, and emits completion or retry events.
- `ai-postprocess-worker`: normalizes detections, applies confidence thresholds, and maps results to domain categories.
- `geospatial-worker`: runs duplicate detection, ward/zone enrichment, and map-grid indexing through `gis-service`.
- `notification-dispatch-worker`: consumes user-facing events and sends email, SMS, and push through provider adapters.
- `webhook-delivery-worker`: signs outbound payloads, retries failed deliveries, and parks poison messages in a dead-letter queue.
- `projection-worker`: builds read models for dashboards, analytics cards, and fast list views.

## Queues

- `issue.submitted`: new reports entering the async pipeline.
- `media.ingest`: image normalization, metadata extraction, and content validation work.
- `ai.inference.requested`: jobs ready for computer vision inference.
- `ai.inference.completed`: raw detection results ready for post-processing.
- `issue.enrichment.requested`: geospatial and dedupe enrichment work.
- `notification.commands`: user or system notifications awaiting dispatch.
- `webhook.commands`: outbound integration events awaiting delivery.
- `projection.commands`: read-model refresh jobs for dashboards and feeds.
- `dead-letter`: messages that exceeded retry policy and require operator review.

Preferred broker: Kafka or a managed equivalent for durable event streams and replay. Redis remains for caching, ephemeral coordination, and low-latency fan-out.

## Authentication

- External clients authenticate with OIDC-compatible login flows and receive short-lived access tokens plus rotating refresh tokens.
- Municipal staff and operators can federate through SSO providers such as Azure AD or Okta.
- Service-to-service traffic uses mTLS plus signed service credentials.
- Authorization is role-based with optional ward or region scoping for supervisors and field crews.
- Gateway validates tokens at the edge; downstream services still verify scopes for defense in depth.

## Database

- PostgreSQL is the primary transactional database family.
- Each service owns its own schema or database boundary. No cross-service direct writes.
- `gis-service` uses PostGIS-enabled storage for spatial queries and route preparation.
- Read replicas support reporting and regional read traffic.
- Cross-service consistency uses the outbox pattern and async event publication rather than distributed transactions.

## Storage

- Object storage is S3-compatible and stores original uploads, transformed media, and model artifacts.
- Buckets are separated by concern: `raw-uploads`, `processed-media`, `model-artifacts`, `webhook-archives`.
- Clients upload through signed URLs issued by `issue-service`.
- Lifecycle rules archive cold media and delete temporary derivatives automatically.

## AI Pipeline

1. The client uploads media to object storage using a signed URL.
2. `issue-service` stores the report shell and publishes `issue.submitted`.
3. `ingestion-worker` validates the asset and publishes `ai.inference.requested`.
4. `ai-inference-worker` calls `ai-service` and publishes `ai.inference.completed`.
5. `ai-postprocess-worker` maps detections to civic categories and confidence bands.
6. `geospatial-worker` enriches the issue with ward, zone, and duplicate-cluster metadata.
7. `projection-worker` refreshes dashboard read models.
8. `notification-dispatch-worker` and `webhook-delivery-worker` fan out external side effects.

## Caching

- Redis is the shared cache and ephemeral coordination layer.
- Cache categories: session state, token introspection cache, hot issue reads, geospatial tiles, notification templates, and WebSocket presence.
- Use cache-aside for reads and explicit invalidation on issue state transitions.
- Do not treat Redis as the source of truth for transactional data.

## Notifications

- Notification events originate from issue state changes, assignment changes, SLA breaches, and AI review outcomes.
- `notification-service` owns templates, user preferences, quiet hours, and provider failover policy.
- Delivery channels: email first, then SMS and push where configured.
- Regional throttles and user-level suppression rules prevent spam during bulk incidents.

## Realtime Communication

- `realtime-service` exposes WebSocket channels for operator dashboards and SSE streams for simple browser consumers.
- Primary live events: issue created, issue status changed, assignment updated, AI processing progress, webhook delivery status, and incident alerts.
- Authenticated channel subscriptions are scoped by tenant, ward, team, and role.

## Streaming

- Browser uploads are streamed directly to object storage instead of proxying large files through API nodes.
- Detection progress is streamed back through SSE or WebSockets.
- Kafka event streams feed projection builders and analytics consumers without blocking request paths.

## API Gateway

- Terminates TLS and enforces CORS, auth, request-size limits, rate limits, and routing policies.
- Exposes one public surface while internal services remain private.
- Handles versioned routing such as `/api/v1/auth`, `/api/v1/issues`, `/api/v1/realtime`, and `/api/v1/webhooks`.
- Publishes request metrics and trace headers for downstream observability.

## Webhooks

- `webhook-service` manages external subscriptions for municipalities, CRMs, and incident-management systems.
- Every outbound event is signed, timestamped, retried with backoff, and persisted for audit.
- Idempotency keys prevent duplicate side effects on receiver retries.

## Observability

- OpenTelemetry is the standard instrumentation layer across Node.js and Python services.
- Prometheus collects metrics, Grafana visualizes dashboards, Loki stores logs, and Tempo stores traces.
- Golden signals are tracked per service: latency, traffic, errors, saturation.
- Queue lag, AI job age, notification backlog, and webhook retry counts are first-class alerts.

## Rate Limiting

- Gateway rate limits by IP, API key, tenant, and authenticated user tier.
- `auth-service` has stricter controls for login, refresh, and password reset paths.
- `notification-service` rate limits per channel and provider account.
- `webhook-service` rate limits per subscriber and target endpoint health.

## Multi Region Deployment

- Deploy stateless services in at least two regions behind a global load balancer.
- Keep one primary write region per tenant for PostgreSQL, with cross-region replicas for reads and disaster recovery.
- Redis stays regional; it is rebuilt from system-of-record data during failover rather than stretched globally.
- Object storage uses cross-region replication for uploads and model artifacts.
- Event streams are regional first, with mirrored topics for disaster recovery and analytics replay.
- Failover policy favors controlled regional promotion over active-active writes to the same transactional database.

## Folder Scaffold

```text
docs/
  architecture/
    distributed-system.md
apps/
  api-gateway/
  auth-service/
  issue-service/
  ai-orchestrator/
  ai-service/
  gis-service/
  notification-service/
  realtime-service/
  webhook-service/
workers/
  ingestion-worker/
  ai-inference-worker/
  ai-postprocess-worker/
  geospatial-worker/
  notification-dispatch-worker/
  webhook-delivery-worker/
  projection-worker/
packages/
  contracts/
  events/
  telemetry/
infra/
  queues/
  kubernetes/base/
  kubernetes/regions/
  monitoring/otel/
```
