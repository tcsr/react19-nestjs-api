# Domain-Driven Design — Study Notes

Code: `src/topics/ddd/order/` · Deep dive: `docs/architecture/ddd.md`

## Core idea
- **Def**: model software around the business domain + its language, split into
  strategic (boundaries/language) and tactical (code patterns).
- **When**: complex domains with real business rules; overkill for simple CRUD.

## Strategic — quick recall
- **Ubiquitous language**: shared dev+expert vocabulary, in the code.
- **Bounded context**: consistency boundary for one model; same term differs across
  contexts. → **maps 1:1 to a microservice**.
- **Subdomains**: core (invest) / supporting / generic (buy).
- **Context mapping**: shared kernel, customer–supplier, conformist, **ACL**
  (anti-corruption layer), open host service / published language.

## Tactical — building blocks (with this repo's files)
| Block | Rule | File |
|---|---|---|
| Value object | no id, immutable, equal by value, self-validating | `money.vo.ts` |
| Entity | has id + lifecycle, equal by id | (Order root) |
| Aggregate root | only entry point; consistency boundary; ref others by id | `order.aggregate.ts` |
| Domain event | past-tense fact; published after save | `events.ts` |
| Repository (port) | one per aggregate; interface in domain | `order.repository.ts` |
| Application service | orchestrates use case; no business rules | `place-order.usecase.ts` |
| Adapter | infra impl of a port (in-memory/Prisma/Kafka) | `infrastructure/*` |

## Aggregate rules (most-tested)
1. Outside code touches only the **root**, never children directly.
2. Root enforces **all invariants**; change via methods, not setters.
3. **One transaction = one aggregate**; reference other aggregates by **id**.
4. Cross-aggregate consistency is **eventual** (domain events + sagas).

## Hexagonal (ports & adapters)
- Domain at the center, depends on nothing. Ports = interfaces owned by domain;
  adapters = infra impls injected in (DI). Swap adapter (InMemory→Prisma,
  Console→Kafka) without touching domain/application. = dependency inversion.

## Related patterns
- **CQRS** (split read/write models) · **Event sourcing** (events as source of
  truth) · **Outbox** (atomic save + publish) · **Saga** (cross-service txn).

## Quick Q
- Unit of microservice decomposition? → Bounded context.
- Entity vs value object? → identity+lifecycle vs immutable value equality.
- What is an aggregate? → consistency boundary with a single root entry point.
- Where does the repository interface live? → the domain (port); impl in infra.
- Keep domain pure how? → depend on ports; inject adapters (hexagonal).
- Cross-aggregate consistency? → eventual, via domain events + sagas (not one big
  transaction).
