# Layer-Complete Asset Planning

Read this before planning or generating any visual whose rear, subject, and
front planes may move at different speeds, directions, scales, or rotations.

Do not use this three-depth-plane contract for a bottle, tank, gauge, bezel, or
other rigid frame whose internal contents change. That mechanism uses
[canonical-containers.md](canonical-containers.md): one clean plate, one unique
canonical frame, one complete contents-only state sheet, and one shared
interior mask. Treating water plus a separate waterline as depth members gives
two nodes authority over the same surface and is invalid.

## Decide Motion Capability Before Source Generation

An opaque composed image contains only the pixels visible in that composition.
It does not contain the hidden bottom of a boat, the background behind a
character, or the continuation of a foreground wave. Mask extraction from that
image can recover visible fragments, not complete motion-capable layers.

Choose one capability:

| Capability | Permitted source | Permitted motion |
|---|---|---|
| `rigid-locked` | one approved `rigid-master` | whole-master/group/camera motion only |
| `bounded-relative` | one `registered-layer-sheet` or `context-preserving-layer-edits` package | member-relative motion inside the proved reveal envelope |

Never label a flat opaque master as `bounded-relative`. If a project needs only
carrier motion, retain it as `rigid-locked`; do not create a false registered
family by masking visible fragments.

For a host edit that preserves the requested aspect ratio but returns a
chroma-key `subject` or `support-front` member short by exactly one pixel on
either canvas edge, do not retry blindly, resize the provider root, or rewrite
the historical request. Keep the consumed attempt rejected, recover the
untouched full output with `provider:recover-rejected-source`, and derive the
registered member with the observed key plane plus an explicit top-left
`placement` at its actual dimensions. The deterministic registered-family
derivative may leave only that missing outer pixel transparent over the clean
rear plate. This recovery is forbidden for an opaque rear plate, for outputs
larger than the registration canvas, for drift above one pixel per axis, or
without passing full-canvas observed-key evidence.

This finite-canvas decision is separate from a persistent travelling world.
When a car, train, or boat stays near the focal corridor while mountains,
trees, road, or shoreline keep moving beyond the viewport, use
`looping-environment`. Each semantic `world-strip` owns one proved horizontal
canonical tile and an infinite logical world; the group owns one tracked
subject and may own additional declared participants. Each subject explicitly
chooses screen or ground/world anchoring and its foreground-occlusion
relationship. A participant may be one complete composition group, such as a
frog plus its registered lily-pad support layers; the renderer applies one
world offset to the group carrier so its internal contact and occlusion remain
locked. Do not enlarge a
`registered-depth-stack` envelope or duplicate image nodes to simulate this.

Every strip must also declare what visible surface it provides. A ground
derivative is not accepted merely because its rectangular transform reaches the
bottom: its source alpha must prove full horizontal span and real visible
support at both repeat edges. Near strips must prove a visible foreground band
that can actually overlap the declared subjects.

When an opaque lower strip overlaps a complete rear plate at a different
parallax speed, crop it from the matching registered source coordinates and
declare `alphaFeather.topPixels` (or `bottomPixels`) on the deterministic
looping-strip derivative. The derivative fingerprints the feather, proves the
resulting alpha edges at canonical and render scales, and records it in the
binding. Do not hide a hard horizontal join by blur, a semitransparent rectangle,
or a second generated background.

Provider-native key planes may contain shadows that are darker versions of the
declared chroma colour. Chroma removal must measure distance from the
key-colour ray with a near-black ink floor, then despill and pad transparent
RGB. Plain Euclidean distance leaves those shadows as opaque magenta fringes;
raising the threshold until they disappear can instead erase warm flowers and
skin tones. Visual proof must composite keyed foregrounds over the actual world
colour, not only inspect alpha on a checkerboard.

Layer completeness does not by itself prove that a visible subject is standing
or sitting on the layer. For every hero contact, add a root
`spatialContracts[]` grounding record that binds the subject's normalized or
registered state anchor to an explicit polyline on the actual support consumer.
The contract samples the complete ancestor transform chain, camera/parallax,
keyframes, idle motion, emphasis, and world anchoring. Use `locked-contact` for
a seated or held tableau; it rejects relative drift even when each sampled
anchor remains inside a broad contact zone.

Paint order follows browser stacking contexts, not the largest descendant
`z`. A `support-front` inside a lower top-level group cannot cover a subject in
a higher sibling group. When foreground overlap is narratively required, bind
the exact visible foreground node and relation in the grounding contract and
structure the runtime consumers so their first divergent stacking ancestors
have the correct order. Do not duplicate the foreground asset at low opacity or
raise the subject out of contact to fake clearance.

When a top-level visible `registered-depth-stack` must interleave with an
external scene subject, declare `stackingContext=scene`. Its group transform,
opacity, and visibility must remain static: x/y/width/height/anchors may define
one axis-aligned layout carrier, but scale stays `1`, rotation stays `0`, opacity
stays `1`, and no path/idle/visibility animation is allowed. Each complete
registered member uses its own unique integer `z`, so the rear and subject
planes can remain below an external subject while `support-front` paints above
it. The renderer lays every member out against the carrier's actual pixel size
without creating an intermediate stacking context. It keeps the shared
registration canvas, camera/parallax, reveal-envelope proof, and source-family
provenance while exposing only member stacking order to the scene. Use this
only for a top-level visible depth stack; coupled groups that need a moving
carrier remain isolated.

When one registered member contains several disconnected semantic paper
objects that require different scene depths, run
`assets:derive-semantic-slices` before authoring final consumers. The spec binds
the active full-canvas source SHA, alpha threshold, minimum component area,
semantic role, and exact connected-component bounds. Exactly one `remaining`
slice must receive every unlisted component. Every output preserves the source
canvas and records a `semanticSliceBinding` with component counts, alpha-pixel
accounting, zero boundary cuts, source/output hashes, and a deterministic
fingerprint. Use the outputs as independently ordered animals/elements or as
full-canvas masks for a refined three-member registered family. This costs zero
provider calls. Never use loose crop rectangles that cut through alpha or leave
unassigned source components.

## Compile the Source Package Before Provider Approval

For every layer-aware treatment, author:

- a stable `sourcePackageId`;
- `pattern=supported-subject` for a contact carrier or
  `pattern=registered-depth-stack` for independent depth planes;
- `motionCapability`;
- `sourceStrategy`;
- exactly three ordered layer intents when capability is
  `bounded-relative`:
  - `support-rear` with `completeness=clean-plate`;
  - `subject` with `completeness=full-silhouette`;
  - `support-front` with `completeness=full-overlay`;
- strict depth order `support-rear < subject < support-front`;
- non-negative maximum x/y/scale/rotation reveal limits for `16:9`, `9:16`,
  and `1:1`.

When the complete subject must cross a large part of the world while the clean
rear and full front overlay stay locally stable, additionally author
`subjectTravelEnvelope` for all three responsive profiles. It is separate from
the ordinary reveal envelope: only the `subject` slot may consume it. The
compiler fingerprints it in the source-package plan, runtime validates the
subject trajectory against it, and family proof renders lower-left and
upper-right subject-only extremes. Do not enlarge the common reveal envelope to
smuggle background or foreground motion into this capability.

`project:storyboard` compiles this into
`directingSummary.generationBudget.sourcePackagePlans`. The combined concept
approval must copy `sourcePackageDecision` exactly. It records structural
minimum calls, expected calls, local derivatives, avoided calls, and the
profile hard ceiling. A ceiling is planning capacity, not provider
authorization or automatic spending. Creative Plan v4 separately records
`approvedImageBudget.imageAttemptLimit`; the combined approval's
`budgetDecision.imageAttemptLimit` must cover the expected calls, stay at or
below the profile ceiling, and becomes the only limit the attempt ledger may
reserve against.

One single-scene profile reserves:

| Profile | Base attempts | Layer-package reserve | Hard ceiling |
|---|---:|---:|---:|
| `draft` | 4 | 2 | 6 |
| `balanced` | 4 | 4 | 8 |
| `full-depth` | 6 | 6 | 12 |

For `full-depth`, a one-scene competitive or dialogue story can reserve two
independent hero pose-sheet families; it must not combine unrelated identities
merely to fit the scene count. The reserve scales with scene count. The compiler rejects a storyboard whose
structural minimum exceeds the ceiling.

## Source Strategies

### Registered layer sheet

Use one schema-v8 image request with the current project's exact
`styleProfileBinding`, all bound directives present in the prompt, and:

- `sourceStrategy=registered-layer-sheet`;
- `packageRole=registered-sheet`;
- `outputSurface.mode=layer-sheet`;
- a 2×2 `sheetLayout` containing `reference`, `support-rear`, `subject`, and
  `support-front` exactly once;
- opaque `reference`/`support-rear` cells and alpha or flat chroma-key
  `subject`/`support-front` cells; default to a declared chroma key when the
  selected host model does not reliably emit native alpha;
- for provider-native chroma cells,
  `keyPlane={mode:"provider-native-observed",policyId:"flat-v1"}`. The
  requested color is prompt intent, not an exact-output assertion. The output
  must instead form one stable, connected, boundary-covering color plane with
  bounded cluster spread, adequate foreground separation, and mutually
  consistent observed colors across keyed cells;
- optional `providerSource` when provider-native dimensions or separators
  require explicit post-generation cell rectangles;
- all three `memberAssetIds`;
- the complete source master in `referenceAssetIds`;
- the formal recovery policy.

The provider root remains byte-for-byte unchanged. The provider observation
records requested/observed colors, cell rectangles, coverage, boundary,
cluster, connectivity, foreground-separation metrics, the policy fingerprint,
and one source-bound observation fingerprint. The registered-family spec
declares explicit `sourceRect`, destination placement, and keying parameters
when needed; the CLI performs separator removal, keying, and scaling as part of
the same three fingerprinted local members. This costs one expected provider
image call, creates three deterministic local derivatives, and avoids three
calls compared with reference + three full-context edits.

The layer-stack reference proof uses the same floor-bounded grid convention
for the reference cell, so odd provider-native widths or heights remain
reviewable without resizing or overwriting the provider result.

### Context-preserving layer edits

Use one complete reference generation plus three provider edits. Every member
request lists the same package, all member ids, all reference ids, exact role
and completeness, and uses the complete reference as
`compositionBinding.derivation.parentAssetId`. This costs four expected
provider calls and normally creates three canvas-normalization derivatives.

Never generate one family member without the full source package context. For
repair, try deterministic local processing first. If new pixels are required,
use a mask against the complete original source context; otherwise regenerate
the complete source package.

A provider output already closed as `rejected` is never edited back into the
ledger. A schema-v1 rejected-output recovery spec may name the historical
request, exact raw file/SHA, attempt id, and `flat-v1` observations. A
standalone chroma-key output uses exactly one full-canvas `image` observation;
a registered layer sheet uses its `subject` and `support-front` keyed-cell
rectangles. `provider:recover-rejected-source --check` is read-only. Without
`--check`, it may append one manifest record with lifecycle `recovery-source`
only after the attempt remains `rejected`, quota remains consumed, request and
output identity match, and every observed plane passes. It never reserves or
spends quota and never writes `generation-attempts.jsonl`.
An accepted `recovery-source` may be the parent of a deterministic derivative
(such as a keyed looping strip); the derivative records that exact recovered
parent and may enter the current execution tree, while the rejected ledger
event remains unchanged.

## Runtime and Provenance

`assets:derive-looping-strip` consumes schema-v1 horizontal strip specs. The
active source record, canonical period/crop, RGB and alpha edge bands,
source/render-scale thresholds, three responsive viewport spans, recovery
policy, output SHA, lifecycle, and derivation fingerprint become one
`loopingStripBinding`. `exact` accepts already matching edge bands;
`overlap-crop` selects one declared period deterministically. `mirror-crop`
concatenates a declared complete interior crop with its horizontal mirror so a
paper road with transparent presentation margins repeats without exposing a
white/empty gap; it remains a recorded local derivative, never a runtime
clone-brush. A provider-native
`chroma-key` source may be used for a sparse mid/ground/near strip only when
the spec declares the matching `sourceSurface.keyColor` plus deterministic
`keying` thresholds; the derivation verifies the active source request's
color-key provenance, produces a real-alpha tile, and records the keying
metadata hash beside the strip binding. `opaque` remains the default for a
full far plate. A recovery-source with verified
`baked-checkerboard-alpha/checkerboard-alpha-v1` provenance may be converted
to real alpha inside this deterministic derivation; its raw provider output
remains unchanged. Optional `decorativeScatter` crops reviewed source regions
into independent sprites and applies explicit seeded placements, scales,
flips, rotations, and bottom anchors before tiling. Optional
`edgeStabilizationPixels` duplicates only a narrow complete source-edge band
before mirror tiling when render-scale resampling would otherwise create
isolated edge spikes; all source and three-profile seam proofs still apply.
Edge equality is necessary but not sufficient: the derivative also scans
premultiplied-RGBA contrast across the outer tile boundary at source and every
render scale, because equal border pixels can still form a conspicuous vertical
rail beside their neighbors. `mirror-crop` additionally proves the internal
mirror fold. Both locations must pass the same deterministic seam-salience
policy and remain visible in the three-tile evidence.
Recovery order is local key/period/crop correction, a masked
edit with the complete original strip and both edge neighborhoods visible, then
complete-strip regeneration. Isolated edge generation and runtime crossfade
seam hiding are invalid.

Before any provider call for a `looping-environment`, run
`project:world-topology-proof -- <slug>`. It renders provider-free SVG evidence
from the compiled directing plan and proves one tracked screen subject, ordered
far/mid/ground/near depth with faster near motion, a real ground role, at least
one viewport of travel, and ordered before/seam/after moments. The image request
must carry the exact current proof binding. Storyboard or world-plan drift makes
that binding stale before quota can be reserved.

`assets:derive-registered-family` consumes only schema-v2 family specs. Every
member must:

- preserve the entire shared canvas and top-left origin;
- share registration, source master, source package, strategy, recovery
  policy, and family fingerprint;
- record role, completeness, source lineage, hash, lifecycle, and
  `trimmed=false`;
- for chroma cells, record the source surface, source rectangle, requested and
  observed key colors, observation/policy fingerprints, exact keying
  parameters, and current key-metadata SHA;
- remain an active `registered-family-member` manifest record.

When the `subject` is a `state-sequence`, each visual state must keep a complete
three-member family context. Use a `state-sheet-cell` source for the subject,
bound to its exact `poseFamilyId` and `stateId`, and give it an explicit
placement on the shared registration canvas. Derive one complete family per
state while reusing the same registered support rear/front source package.
This is deterministic assembly from the existing state sheet and support
package; it consumes no additional provider call. Tight standalone images,
unregistered alpha files, and hand-authored manifest aliases are rejected.

If one provider cell contains the complete transparent support silhouette, a
`support-front` registered-sheet cell may also supply `support-rear` by
declaring `reuseAsRole: "support-rear"`. The reused rear must use the current
chroma-key contract and must not declare a clip, so it preserves the complete
support. The normal front member may derive a clipped occluding edge from that
same cell. This is preferable to moving an opaque clean-plate rectangle over a
different environment.

`registered-depth-stack` has exactly three asset children, one per role. Each
child keeps a full-canvas transform, declares its own depth, and stays within
the smallest authored reveal limit across the three responsive profiles.
Layer scale may stay at `1` or expand above it but may never shrink below `1`;
the envelope's `scale` is reviewed protective overscan expansion, not
permission to reveal outside a clean plate. Camera parallax may use those child
depths only when its zoom/focal-depth combination also keeps every resolved
member scale at or above `1`. Other coupled groups remain one depth carrier.
When `subjectTravelEnvelope` exists, the subject instead uses its smallest
responsive travel limit; rear and front members remain governed by the ordinary
reveal envelope.

## Proof

Single-asset motion stress is not sufficient for a layer family. The
composition proof must produce:

- neutral reconstruction;
- reference-versus-reconstruction comparison;
- checkerboard exploded view of all three complete members;
- original and actual render-scale alpha-band evidence per member;
- both reveal-envelope extremes at `16:9`, `9:16`, and `1:1`.
- when authored, both subject-only travel extremes at `16:9`, `9:16`, and
  `1:1`.

Every responsive envelope extreme must have zero transparent pixels in the
final composite. Human review still decides whether the rear is a credible
clean plate, the subject silhouette is complete behind occluders, the front
overlay is complete, and the reconstructed composition preserves the approved
meaning.
