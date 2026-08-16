# Provenance and sanitization

The machine-readable source register is [`provenance/sources.yaml`](../provenance/sources.yaml).
Every OpenAPI operation references at least one source identifier and states
which claims that source supports.

## Manifest fields

- `kind`: discovery, authenticated UI, private draft, vendor specification, or independent client;
- observation/review date and Polish market scope;
- public source URL or pinned repository commit where appropriate;
- SHA-256 for omitted local artifacts;
- service or client version when known;
- redistribution status and sanitization notes.

A hash demonstrates which private artifact informed a claim. It does not make
that artifact public, prove ownership, or grant redistribution rights.

## Public/private boundary

The public repository contains only independently authored interface facts,
documentation, tests, and synthetic examples. The following remain outside
the repository:

- raw discovery responses and response bodies;
- the verbatim advertised collection-feed specification;
- captured HTML, JavaScript, browser/session data, and authenticated responses;
- broad internal/back-office catalogs;
- recipes, media, notes, account data, and device identifiers.

The private source archive is not part of the Git history. Contributors must
follow the same boundary and should keep raw captures access-controlled and
short-lived.

## Changing a claim

Update the operation's status, last-verification date, supported-claim list,
and risk classification together. Add or revise a manifest entry without
committing the underlying capture. Advertised discovery alone supports a path,
not a method, authentication requirement, request schema, or response schema.
