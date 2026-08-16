# Coverage

The canonical specification contains 44 path templates and 57 operations.

| Evidence status | Operations |
| --- | ---: |
| Observed | 21 |
| Corroborated | 18 |
| Advertised-only | 15 |
| Vendor specification | 3 |

The full mapped surface remains in one OpenAPI document, including uncertain
advertised methods and sensitive device/feed operations. Static documentation,
per-operation evidence, conservative authentication modeling, and explicit
risk metadata are used to prevent that breadth from being mistaken for a
verified or safe-to-execute SDK contract.

Known bodies are typed or explicitly partial. Unknown bodies resolve to
`UnknownJson`. The source-policy tests keep the operation count, evidence
references, security declarations, feed contract, mutation classification, and
schema boundaries from silently drifting.

The discovered `/search/api/subscription/token` route is omitted because its
response may be credential-like. Broad internal/back-office relations from the
private research catalog are also outside this public repository.
