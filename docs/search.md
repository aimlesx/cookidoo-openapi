# Search, clusters, filters, and pagination

The legacy search and cluster routes are still advertised by HAL discovery but
are not the backend used by the current Cookidoo web search. Low-volume public
reads on 2026-08-17 nevertheless confirmed that all five routes accept an
unauthenticated `GET` and return JSON:

| Route | Confirmed response core |
| --- | --- |
| `/recipes/cluster/{clusterId}` | Array of v1 cluster entries |
| `/recipes/cluster/2/{clusterId}` | Array of v2 entries, adding `languageTag` |
| `/search/api/{lang}/search` | `{ data: SearchRecipeCard[] }` |
| `/search/api/{lang}/stripe` | `{ data: SearchRecipeCard[] }` |
| `/search/api/ingredients` | `{ ingredients: IngredientSuggestion[] }` |

The cluster entry fields and one public `limit=1` item shape for each search
route are modeled in `openapi.yaml`. Objects remain extensible because one item
cannot establish every context, optional field, collection result, language,
or feature-flag variant.

## Exploded filters

Discovery advertises `filters*`. In RFC 6570, the trailing `*` means an
exploded variable; it does not prove an array encoded as repeated
`filters=value` pairs. Companion links advertise individual names such as
`tags`, `categories`, `ratings`, `preparationTime`, `portions`, `difficulty`,
`totalTime`, `tmv`, `countries`, `languages`, `additionalDevices`,
`accessories`, `sortby`, `ids`, `ingredients`, `excludeIngredients`,
`excludeTags`, `exclude`, and `like`.

The specification therefore models `filters` as a form-exploded object whose
properties become independent query keys. Values are deliberately opaque
scalars. The current web page commonly joins multi-values with commas, but that
different client-side search implementation does not prove that every legacy
API filter accepts the same delimiter, repetition, enum, duration unit, or
numeric range.

## Pagination and limits

The legacy search link advertises a scalar `pagination` variable. It does not
say whether that scalar is a page number, cursor, offset, or opaque token. The
observed synthetic and `limit=1` responses contained `data` only and exposed no
verified continuation field. `pagination` therefore remains
`OpaqueQueryScalar` and generated clients must not invent automatic paging.

A numeric `limit=1` was accepted by the three search reads, but this establishes
neither its range nor its default. `includeRating` and `lazyLoading` are also
kept opaque because their names alone do not prove boolean parsing.

## Cache and retry observations

One public search response supplied an `ETag` and varied on content encoding.
One cluster miss instead used `no-cache, no-store, must-revalidate` and varied
on origin. Neither response exposed `Retry-After` or a recognized rate-limit
header. These are single read observations, not cache, quota, retry, or
concurrency guarantees; see [Protocol behavior](protocol-behavior.md).

The credential-like `/search/api/subscription/token` relation remains
intentionally omitted.
