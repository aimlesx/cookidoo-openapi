# Changelog

All notable changes to this independently authored specification will be
recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and project versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- A request-only contract for created-recipe `TTS` annotations, covering time,
  temperature, speed, direction, and their text span without narrowing response
  compatibility for unknown annotations.
- Guidance for preloaded Thermomix settings and the on-device execution boundary.

## [0.2.0] - 2026-08-17

### Added

- Typed or partial response contracts for search, recipe clusters, created recipes, organizer lists, planning, shopping, notes, profiles, and subscriptions.
- Authentication/cookie/CSRF, search semantics, and protocol/retry documentation.
- A localized community-profile read observed in the current first-party UI.

### Changed

- Reduced unknown response shapes from 41 to 15.
- Confirmed 11 of the 15 previously advertised-only operations with safe reads; four mutation operations remain advertised-only.
- Corrected exploded search filters, opaque pagination/limit semantics, public-read authentication, profile-update validation, and `Retry-After` modeling.

## [0.1.0] - 2026-08-16

### Added

- Publication-ready OpenAPI 3.1 specification for 44 paths and 57 operations.
- Per-operation evidence, response-shape, authentication, and risk metadata.
- Sanitized provenance manifest, synthetic examples, policy tests, and static documentation build.
