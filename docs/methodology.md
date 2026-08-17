# Methodology

## Scope

The specification describes the Polish Cookidoo web surface observed through
2026-08-17. It retains the private research surface and adds one localized
profile read confirmed by the current first-party UI, for 58 operations total.
That breadth is paired with explicit uncertainty: four mutation operations
remain advertised-only and must not be read as verified contracts.

Other markets, native clients, device firmware, subscriptions, feature flags,
and later service versions may behave differently. The canonical server is
therefore `https://cookidoo.pl`, not a variable multi-market host.

## Evidence classes

- **Observed:** visible in a first-party authenticated UI, current frontend bundle, or narrowly scoped private-account observation.
- **Corroborated:** implemented by an independent client at a pinned commit and consistent with discovery or UI evidence.
- **Advertised-only:** present in public HAL-style discovery. Only the route is treated as directly supported unless another source confirms more.
- **Vendor-spec:** independently expressed interface facts from an advertised specification; the source document itself is not redistributed.

This was not a clean-room exercise. The public specification is independently
written, but the underlying research considered first-party interfaces,
service discovery, an advertised specification, and third-party clients. The
provenance manifest records those boundaries.

## Authentication

The first-party browser uses an OAuth authorization-code flow with PKCE and
then operates with a browser session. The authentication guide records the
returned login form's field and encoding contract, but does not provide a login
client, hard-code a captured identity action, export cookies, or model the full
cookie jar. The cookie security scheme is a partial description and does not
guarantee that a generated request will satisfy CSRF or other session
protections.

Collection-feed operations use Basic authentication because that is what the
advertised feed specification declares. No credentials, acquisition method,
or claim of public availability is provided.

## Schema policy

Observed fields are typed when the available evidence supports their shape.
`typed` means a useful top-level and core field contract is established; an
object may still allow forward-compatible extra properties. `partial` means a
material envelope, item variant, or field set remains unresolved. Completely
unverified response bodies use `UnknownJson`, an unconstrained schema, rather
than a misleading generic object. Synthetic examples demonstrate shape without
copying service or user content.

The route `/search/api/subscription/token` is intentionally omitted despite
appearing in discovery and UI observations because its response is potentially
credential-like. The omission avoids normalizing token retrieval as a public
integration surface.

## Live-observation boundary

Repository tests validate only local files. They perform no Cookidoo requests,
create no accounts, and execute no mutations.

The 2026-08-17 research pass separately used low-volume read-only requests with
synthetic misses or already-public resources. Only status, media type,
authentication behavior, key names, top-level kinds, scalar types, and selected
cache headers were retained. Temporary bodies were not added to the repository.
No account mutation, deletion, public sharing, rating change, device action,
rate-limit probe, or concurrency stress test was performed.
