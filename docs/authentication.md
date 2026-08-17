# Authentication, cookies, and CSRF

This page records the authentication behavior supported by current evidence.
It is an interoperability description, not a login SDK, and it does not make
Cookidoo's internal browser interfaces a supported public API. Never commit,
log, or export credentials, authorization codes, PKCE verifiers, cookies, or
captured identity-provider pages.

## Two related, but distinct, layers

Public OIDC discovery describes an identity service with authorization, token,
userinfo, key, logout, introspection, and revocation endpoints. It also
advertises several OAuth capabilities. Discovery proves that the identity
service advertises those capabilities; it does not prove that every grant is
available to a Cookidoo web client, that an arbitrary public client may use the
token endpoint, or that market API operations accept bearer tokens. The
[source register](../provenance/sources.yaml) records this metadata review as
`oidc-discovery-2026-08-16`.

Account-scoped Polish market operations described in `openapi.yaml` are instead
observed behind a browser cookie session. Several recipe, search, cluster, and
aggregate-rating reads are confirmed public and have an explicit empty
`security` requirement. Keep the OIDC flow and the resulting protected market
session conceptually separate:

1. Create a fresh, isolated cookie jar for one account and one market.
2. Start with
   `GET /profile/{lang}/login?redirectAfterLogin={percent-encoded-path}`. Keep
   the redirect target same-origin and relative; for example, a normal Polish
   landing page can be used instead of an API operation.
3. Follow the first-party redirect chain. The chain uses an OIDC authorization
   code flow with PKCE and presents the identity-provider login form. The
   current flow returns an opaque `requestId`; submit it together with the
   `username` and `password` controls as `application/x-www-form-urlencoded` to
   the exact form action produced for that attempt. Do not hard-code or replay
   a captured action URL or request ID. Submit credentials only to the expected
   first-party identity host.
4. Preserve the same cookie jar and every opaque authorization parameter across
   the redirect chain. Let the first-party flow manage its PKCE verifier and
   challenge. A standards-aware implementation must preserve and validate
   `state` and `nonce`, and bind the returned code to the matching verifier;
   never substitute or reuse any of them.
5. Follow the completion redirects back to the requested market page. A
   successful page load and access to an authenticated read are stronger
   evidence of success than the presence of any one marker cookie.
6. Reuse the complete jar for same-account requests. Do not copy selected
   cookie values into source code or treat this flow as a way to mint a
   standalone bearer token.

The market-side OAuth proxy, rather than an independently configured public
client, completes the callback used by this browser flow. Public OIDC metadata
advertises a token endpoint and PKCE methods, but does not establish that a
standalone integration has a permitted client authentication method or that a
resulting bearer token is accepted by the market API.

The redirect chain's exact intermediate hosts, form fields, cookie set, cookie
attributes, rotation rules, and logout invalidation behavior remain outside
the verified contract. Clients should let a standards-aware redirect and
cookie implementation enforce host, path, `Secure`, `HttpOnly`, `SameSite`, and
expiry rules rather than flattening the jar into a manually assembled `Cookie`
header.

## Observed cookie markers

A current independent client considers both `_oauth2_proxy` and
`v-authenticated` when deciding whether its browser login completed. The
former is the only cookie named in the OpenAPI cookie security scheme.
`v-authenticated` appears to be a browser authentication marker; it is not, by
itself, an authentication credential and must not be used as proof that a
session is valid.

Those two names are a partial observation, not a complete cookie-jar schema.
Other cookies may be required by the identity provider, OAuth proxy, market,
consent configuration, or feature flags. Cookie values and attributes were
intentionally not captured in this repository.

Use one jar per account and isolate concurrent login attempts. If a protected
read returns `401`, a client may serialize one fresh login attempt and retry
that read once. A `401` does not make a mutation safe to replay; use the
reconciliation guidance in [Protocol behavior](protocol-behavior.md).

## Request encoding and CSRF observations

Current first-party core code handles many server-rendered forms by collecting
their controls, serializing the result as JSON, honoring a rendered `_method`
override, and adding:

```http
X-Requested-With: xmlhttprequest
```

This is useful compatibility evidence, but it is not a universal CSRF recipe.
No generic CSRF field or header was observed on the inspected created-recipe,
shopping-list, or profile forms. That negative observation does not prove that
CSRF checks are absent: the service may also rely on cookie attributes,
same-origin browser behavior, `Origin` or `Referer`, endpoint-specific tokens,
or rules not exercised by those forms.

Consent handling is an explicit exception in the current core: that code reads
a `csrf_` cookie and sends its value as `X-Csrf-Token`. Do not generalize the
consent-only behavior to recipe, planning, shopping, profile, or account
operations unless the particular form or response supplies the same contract.

Profile details and food-preference controls are rendered as separate forms.
The current UI uses `PUT /community/profile/{lang}/me` for the `username` and
`picture` controls, while food preferences and accessories use separate
`/{lang}/food-preferences` and `/{lang}/accessories` form aliases. Submit only
the controls and method supplied by the relevant form; do not merge those forms
into a guessed account object. Their success response media type and body are
not yet established, so the auxiliary form aliases are not promoted to typed
JSON operations in the canonical specification.

## Logout boundary

The current profile UI links to `/profile/logout`. Discovery also advertises a
market CIAM logout relation, and OIDC metadata advertises an end-session
endpoint. Their required parameters, ordering, cookie invalidation, and effect
on other sessions are not verified. Do not automate logout as cleanup for a
shared browser jar; verify it only with a newly isolated session where session
loss is intentional.

## Evidence confidence

| Claim | Confidence | Important limit |
| --- | --- | --- |
| Market login entry route | Observed | Polish web surface; other markets may differ. |
| Authorization-code flow with PKCE | Corroborated | Redirect-driven browser flow, not a promise of direct token-endpoint access. |
| Public OIDC metadata | Advertised | Capability advertisement only; it does not type market API authentication. |
| `_oauth2_proxy` session cookie and `v-authenticated` marker | Partial | Not a complete jar, and the marker alone is not a credential. |
| Generic JSON form handling and `X-Requested-With` | Observed | Applies to forms using the current core handler. |
| No generic CSRF token on inspected forms | Negative observation | Must not be interpreted as a server guarantee. |
| `csrf_`/`X-Csrf-Token` consent behavior | Observed exception | Consent-specific until proven otherwise. |
