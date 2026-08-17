# Protocol behavior and safe retries

No published retry, rate-limit, idempotency, or concurrency guarantees were
found for the market operations in this specification. Current first-party
and independent-client evidence did not reveal an idempotency-key
contract, `If-Match` write preconditions, a resource version token, or another
general optimistic-concurrency mechanism. One public search read did emit an
`ETag`; that read validator is not evidence of a conditional-write contract.
Absence from the inspected clients is not proof that an unobserved mechanism
does not exist; it means callers cannot depend on one.

## Conservative retry policy

Automatic retries should be limited to reads that have no intended state
change:

- Set a total deadline and a small attempt limit.
- Retry only transient connection failures, `429`, and selected `5xx`
  responses. Do not retry ordinary `4xx` validation or authorization failures.
- If a `429` supplies a valid `Retry-After`, wait at least that long. A
  `Retry-After` header is not guaranteed, and no published quota or fixed
  reset interval was found. Without one, use capped exponential backoff with
  jitter.
- Bound concurrency and back off globally when several requests receive the
  same signal. Do not probe the service to discover its limit.
- After one serialized reauthentication, retry an authenticated read at most
  once. Keep that policy separate from transport retries so loops remain
  bounded.

A current independent recipe importer uses bounded waits for an import-related
rate response. Those waits are client policy, not a server timing guarantee and
should not be copied as a universal schedule.

Two public reads were also checked without attempting to trigger throttling.
Search emitted an `ETag` and varied on content encoding. A cluster miss used
`no-cache, no-store, must-revalidate` and varied on origin. Neither exposed
`Retry-After` or a recognized rate-limit header. A successful response without
those headers says nothing about behavior under load or after a `429`.

## Mutations are not replay-safe by default

A timeout, disconnected response, or gateway error is ambiguous: the server
may have committed the request even though the client did not receive its
response. Do not automatically replay `POST`, `PUT`, `PATCH`, or `DELETE`
solely because the first attempt appeared to fail.

HTTP method semantics do not establish the application's behavior. In
particular, a creation or add operation may duplicate data; an update may
overwrite a concurrent change; and a repeated delete may return a different
status after the first request succeeds. No observed request header lets a
client ask the service to deduplicate a mutation. Do not invent or send an
`Idempotency-Key` and assume it is honored.

Public sharing, rating, device-linking, account, and deletion operations should
always require deliberate confirmation. They should not be hidden inside a
generic retry loop.

## Reconcile before a retry

When a mutation outcome is ambiguous, read the smallest relevant resource and
compare it with the intended state before deciding what to do:

| Mutation area | Reconciliation read | Caution |
| --- | --- | --- |
| Created recipe or copy | Read or list the caller's created recipes. | Names are not unique; prefer a returned identifier and do not infer identity from title alone. |
| Meal planning | Read the affected week or day. | Check the recipe and day together; a concurrent move can make a simple presence check misleading. |
| Shopping list | Read the list and inspect the targeted recipe, ingredient, or additional item. | Adds may duplicate entries; ownership is state, not proof of request identity. |
| Custom or managed list | Re-read the list and its chapters. | Preserve unrelated concurrent edits and ordering. |
| Profile or preferences | Re-read the relevant profile projection. | The detail and preference forms are separate contracts. |
| Delete or remove | Read the parent collection or resource. | Treat an absent item as reconciled only when the read itself is authoritative and authorized. |

If the API offers no sufficiently precise read, stop and surface the ambiguity
to the user. A synthetic client-side operation identifier is useful for logs,
but it does not provide server-side deduplication unless the service explicitly
echoes or enforces it.

## Concurrency

Until conditional requests or resource versions are verified, assume updates
can race and that last-writer behavior is unspecified. Serialize mutations per
logical resource in the client, refetch before editing when preserving unknown
fields matters, and re-read after a write when its response does not establish
the resulting state. A client-side lock coordinates only that client; it
cannot prevent edits from another tab, device, or integration.

Do not use high request volume to test rate or concurrency boundaries. The
responsible default is low concurrency, short bounded experiments on private
account-owned resources, and cleanup only when ownership and reversibility are
clear.

## Evidence confidence

| Claim | Confidence | Important limit |
| --- | --- | --- |
| No idempotency or conditional-write mechanism in inspected clients | Negative observation | A public search `ETag` is a read validator, not proof of `If-Match` support. |
| `429` can occur during recipe import | Corroborated | Does not establish quotas or behavior for other operations. |
| `Retry-After` may be available | Partial | Callers must handle its absence and must not assume a fixed format beyond normal HTTP parsing. |
| No published market quota or concurrency guarantee found | Unknown contract | Use conservative client policy, not inferred limits. |
| Mutation reconciliation is required after ambiguous outcomes | Safety policy | It is a caller strategy, not a Cookidoo guarantee. |
