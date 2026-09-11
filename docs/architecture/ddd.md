# Domain-Driven Design — Architect Cheat Sheet

Wired example: `src/topics/ddd/order/` (hexagonal Order slice, runnable).

## What DDD is
Designing software around the **business domain** and its language, not around
tech. Split into **strategic** (boundaries + language) and **tactical** (code
building blocks) design.

## Strategic DDD
- **Ubiquitous language** — one shared vocabulary used by devs AND domain experts,
  reflected directly in code (class/method names). No translation layer.
- **Subdomains**: **core** (your competitive advantage — invest here), **supporting**
  (needed, not differentiating), **generic** (buy/reuse, e.g. auth, billing).
- **Bounded context** — an explicit boundary within which a model + language is
  consistent. The SAME word can mean different things in different contexts
  ("Customer" in Sales vs Support). **A bounded context maps to a microservice.**
- **Context mapping** — relationships between contexts:
  - **Partnership**, **Shared kernel** (shared model — use sparingly),
  - **Customer–Supplier**, **Conformist** (downstream accepts upstream model),
  - **Anti-Corruption Layer (ACL)** — translation layer protecting your model from
    another context's model (key for integrating legacy/3rd-party),
  - **Open Host Service / Published Language** (a well-defined public API/events).

## Tactical DDD (the building blocks)
- **Entity** — has identity + lifecycle; equal by id (Order, User).
- **Value object** — no identity; immutable; equal by value; self-validating
  (Money, Address). Prefer VOs — they push invariants into the type. *(see money.vo.ts)*
- **Aggregate** — cluster of entities+VOs with ONE **aggregate root** as the only
  entry point and a **consistency boundary**. Rules: reference other aggregates by
  **id** only; one transaction = one aggregate; invariants enforced on the root.
  *(see order.aggregate.ts)*
- **Domain event** — something that happened, past tense, in ubiquitous language
  (OrderPlaced). Recorded by aggregates, published after persistence; the seam to
  other contexts/Kafka. *(see events.ts)*
- **Repository** — collection-like persistence abstraction, one per aggregate;
  interface (**port**) in the domain, implementation (**adapter**) in infra.
  *(see order.repository.ts + in-memory-order.repository.ts)*
- **Domain service** — domain logic that doesn't belong to a single entity/VO
  (e.g. a pricing policy across aggregates).
- **Application service / use case** — orchestrates a use case (load, call domain,
  save, publish); no business rules itself; the transaction boundary.
  *(see place-order.usecase.ts)*
- **Factory** — encapsulates complex aggregate creation.

## Architecture styles (enable DDD)
- **Layered** → **Hexagonal (Ports & Adapters)** / **Onion** / **Clean**: the domain
  is the center and depends on NOTHING; infrastructure (DB, HTTP, brokers) depends
  inward via **ports** (interfaces) + **adapters** (impls). = dependency inversion.
  *(the Order module wires ports→adapters in `order.module.ts`)*
- **CQRS** — separate write model (aggregates) from read model (query-optimized
  projections). Pairs with DDD; not mandatory.
- **Event sourcing** — persist the sequence of domain events as the source of
  truth, rebuild state by replay. Powerful, complex; use where audit/history matter.
- **Outbox pattern** — persist domain events in the same DB transaction as the
  aggregate, then relay to the broker → atomic state-change + publish.

## DDD → microservices (why this matters next)
- **One bounded context → one service.** Products, Orders, Inventory, Payment are
  separate contexts with their own models + databases (database-per-service).
- Services integrate via **domain events** (async, Kafka) + well-defined contracts,
  not shared tables. ACL translates other services' events into your model.
- Aggregates define transaction boundaries → cross-service consistency is
  **eventual**, coordinated by **sagas** (choreography or orchestration).

## Interview signals
- Bounded context is the unit of decomposition — it becomes a microservice.
- Aggregate = consistency boundary; reference other aggregates by id; one txn per
  aggregate.
- Value objects push invariants into types; entities have identity.
- Domain stays pure (ports); infrastructure are adapters (dependency inversion).
- Domain events are the integration seam; outbox for atomic publish; sagas for
  cross-aggregate/service consistency.
