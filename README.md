# Cookidoo OpenAPI (unofficial)

> [!WARNING]
> This independently developed project is not affiliated with, endorsed by,
> sponsored by, or supported by Vorwerk, Thermomix, or Cookidoo. It documents
> an internal web interface observed in the Polish market, not an official or
> stable public API.

This repository contains an OpenAPI 3.1 description of 44 paths and 57
operations observed or advertised on 16 August 2026. The specification keeps
uncertain operations visible, but marks their evidence and risk explicitly.
An advertised path is not proof of a method, payload, permission, or continued
availability.

Cookidoo® and Thermomix® are registered trademarks of their respective owner.
Their names are used only to identify compatibility. No logos, recipe content,
captured responses, application code, or vendor-authored specifications are
included.

## Start here

- [`openapi.yaml`](openapi.yaml) — canonical, single-file specification
- [`docs/methodology.md`](docs/methodology.md) — how observations were classified
- [`docs/provenance.md`](docs/provenance.md) — evidence and sanitization policy
- [`docs/responsible-use.md`](docs/responsible-use.md) — project safety boundaries
- [`docs/legal-context.md`](docs/legal-context.md) — sources reviewed and limitations

The API reference is intentionally generated with Redoc as static,
non-interactive documentation. Do not paste credentials or browser session
cookies into hosted documentation, client generators, issues, or pull
requests.

## Status model

Every operation contains an `x-cookidoo` object:

| Status | Meaning |
| --- | --- |
| `observed` | Seen in the authenticated first-party UI, a current bundle, or a narrowly scoped private probe. |
| `corroborated` | Consistent with a current independent client and other evidence. |
| `advertised-only` | The route is advertised by public discovery; method or payload may be inferred. |
| `vendor-spec` | Independently re-expressed from a currently advertised vendor specification that is not redistributed here. |

Risk metadata distinguishes reads, private writes, deletion, public sharing,
public ratings, and device linking. `responseShape: unknown` deliberately maps
to unconstrained JSON instead of pretending that an unverified response is an
object.

## Validate locally

Requires Node.js 22.12 or newer:

```sh
npm ci
npm run check
```

The check lints and bundles the specification, validates project policy,
generates TypeScript declarations, compiles them, builds static documentation,
and checks the generated artifacts. It makes no Cookidoo requests.

Generated output is written to the ignored `dist/` directory.

## Responsible use

Use Cookidoo only with accounts and data you are authorized to access. This
project does not grant permission to bypass technical restrictions, test
authorization boundaries, access another person's data, redistribute Cookidoo
content, or overload the service. Review the terms applicable to your account
and region before using any observed interface.

See [`SECURITY.md`](SECURITY.md) before reporting a possible vulnerability and
[`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting evidence.

## License

Original work in this repository is available under the [MIT License](LICENSE).
The license boundary and trademark notice are described in [NOTICE](NOTICE).
