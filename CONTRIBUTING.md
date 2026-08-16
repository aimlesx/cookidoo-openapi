# Contributing

Contributions that improve accuracy, provenance, or safety are welcome. A
publicly visible route is not authorization to test it.

## Contribution requirements

By submitting a change, you confirm that:

- you used only your own account/data or another explicitly authorized context;
- you did not bypass authentication, authorization, subscriptions, rate limits, certificate checks, or other technical restrictions;
- you did not perform a purchase, publication, rating, sharing, deletion, device operation, or other high-impact mutation merely to document it;
- you did not include credentials, session state, account/device identifiers, recipes, notes, images, captured responses, application code, or other personal/vendor content;
- examples are synthetic and external sources are attributed with a stable commit or version and license where available;
- the contribution is your original work and may be distributed under this repository's MIT License.

Do not attach HAR/PCAP files, browser profiles, cookie jars, screenshots with
personal data, or authenticated request/response dumps. Contact a maintainer
privately before proposing a security-sensitive or internal/back-office route.

## Evidence metadata

Each changed operation must retain an `x-cookidoo` block and reference an entry
in `provenance/sources.yaml`. Evidence must identify its kind, observation date,
market, relevant client/service version, supported claims, sanitization, and
redistribution status. A discovery link supports the existence of a route; it
does not by itself prove the HTTP method or payload.

## Checks

```sh
npm ci
npm run check
```

CI and project tests must remain offline with respect to Cookidoo. Never add
live account tests to the default suite.
