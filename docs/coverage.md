# Coverage

The canonical specification contains 44 path templates and 58 operations.

| Evidence status | Operations |
| --- | ---: |
| Observed | 32 |
| Corroborated | 19 |
| Advertised-only | 4 |
| Vendor specification | 3 |

| Response shape | Operations |
| --- | ---: |
| Typed | 16 |
| Partial | 27 |
| Unknown | 15 |

The 2026-08-17 review reduced unknown responses from 41 to 15 and
advertised-only operations from 15 to 4. The four remaining advertised-only
operations are mutations that were deliberately not exercised:

- `revokeSharedList`
- `removePlanningDay`
- `movePlannedRecipe`
- `linkConnectedDevice`

Confirming them safely requires isolated account-owned state and, for cleanup
or deletion, a separate deliberate approval. Discovery alone still does not
prove their methods or payloads.

The full mapped surface remains in one OpenAPI document, including uncertain
advertised methods and sensitive device/feed operations. Static documentation,
per-operation evidence, conservative authentication modeling, and explicit
risk metadata are used to prevent that breadth from being mistaken for a
verified or safe-to-execute SDK contract.

Known bodies are typed or explicitly partial. Unknown bodies resolve to
`UnknownJson`. The source-policy tests keep the operation count, evidence
references, security declarations, feed contract, mutation classification, and
schema boundaries from silently drifting.

The five search/cluster routes are now confirmed public JSON reads. Their
containers and observed item cores are modeled, while legacy `filters*` values
and `pagination` remain opaque where current evidence does not establish
delimiter, cursor, or page-number semantics.

The discovered `/search/api/subscription/token` route is omitted because its
response may be credential-like. Broad internal/back-office relations from the
private research catalog are also outside this public repository.
