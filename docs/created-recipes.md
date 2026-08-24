# Created-recipe cooking settings

A created-recipe `STEP` can attach a `TTS` annotation to an exact span of its
text. The annotation carries optional time, temperature, speed, and direction
values. Cookidoo and compatible Thermomix interfaces can render that span as a
control that preloads the saved settings.

This is recipe content, not an appliance-control command. It does not remotely
start a Thermomix. The cook must open the saved settings on the appliance and
start the step there. The official Cookidoo tutorial describes that manual
start boundary in [Cooking with Thermomix](https://cookidoo.pl/foundation/tutorials/pl/courses/how-to-cook/cook-thermomix).

Send instruction changes in a dedicated `PATCH` whose body contains
`instructions`. The reviewed created-recipes client and current web workflow
patch recipe metadata and instructions separately; combining both groups in one
request can produce a validation error. A PATCH replaces the supplied
`instructions` array, so callers should read the current recipe, preserve every
unchanged step, and verify the result by recipe ID after the write.

`position.offset` and `position.length` select the visible text span associated
with the control. The pinned source establishes numeric values but does not
establish provider-side integer, sign, or span-bound constraints. A conservative
client such as `cookidoo-axi` can validate before writing that time, offset, and
length are integers, time and offset are nonnegative, length is positive, and
the selected span stays within the step text. Those checks are client policy,
not API requirements. The precise indexing behavior for non-BMP Unicode text
and service limits for time, temperature, speed, overlapping spans, or
annotation count have not been verified.

The request contract is based on the pinned independent-client evidence listed
in [`provenance/sources.yaml`](../provenance/sources.yaml). It documents an
observed internal interface, not an official or stable public API.
