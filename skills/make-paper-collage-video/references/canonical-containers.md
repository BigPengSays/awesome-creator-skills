# Canonical Containers and Internal State

Read this reference whenever a rigid vessel, gauge, window, cavity, screen, or
similar prop keeps one visible outer frame while its internal contents change.
Examples include a bottle whose water rises, a tank that fills, a transparent
jar whose contents accumulate, or a gauge whose colored region changes inside
one fixed bezel.

## Why This Is Its Own Pattern

Do not assemble these mechanisms from independent full-scene bottle, water, and
waterline images. That gives several assets authority over the same pixels and
allows their scale, placement, crop, or provider redraw to drift independently.
It also makes an extra surface strip look plausible to the schema even when it
duplicates the water already visible in the main fill.

Use `canonical-container` when all of these are true:

- one clean scene plate exists behind the prop;
- one canonical outer frame owns every visible rim, wall, outline, and bezel;
- one state sequence owns the complete internal surface;
- every internal state can be clipped by the same authored interior polygon;
- the mechanism has measurable ordered states and a measurable terminal state.

Use `registered-environment` for a shared world boundary such as shore/water or
wall/floor. Use `registered-depth-stack` for three complete planes that may move
relative to one another. Neither pattern substitutes for a canonical rigid
frame with changing internal contents.

## Authoring Contract

Route the beat through:

- `changeClass=mechanism-state`;
- `semanticRisk=mechanism`;
- `motion.kind=state-sequence`;
- `composition.pattern=canonical-container`.

The `composition.container` intent declares:

- stable `groupId`, `familyId`, `sourcePackageId`, registration, and source
  master;
- the exact clean-plate, canonical-frame, content-sheet, and interior-mask
  asset ids;
- one `authoritativeSurfaceId` for the entire internal surface;
- a normalized polygon `interiorShape`;
- `center-bottom` alignment thresholds;
- strictly increasing states with sheet cells, normalized `at`, and declared
  `fillLevel`;
- the highest-fill final state plus minimum fill, maximum rim gap, and minimum
  bottom-band coverage;
- the fixed context-preserving recovery policy.

`project:storyboard` compiles one `canonicalContainers[]` plan. The provider
budget is always three roots: one clean plate, one canonical frame, and one
complete content-state sheet. The interior mask and every runtime state are
local deterministic derivatives. Do not count one image call per fill state.
The compiled plan preserves the exact base canvas, sheet rows/columns, every
state's row/column/`at`/`fillLevel`, interior shape, alignment thresholds,
terminal policy, and recovery policy. A provider request whose
`containerPackageBinding` differs on any of those fields is rejected before an
attempt can run.

## Provider Roots

Every root uses schema-v8, the current Style Profile, one
`containerPackageBinding`, `mechanism-critical` semantic binding, and the
compiler-owned group registration.

| `packageRole` | Surface | Required prompt directive | Required role checks |
|---|---|---|---|
| `clean-plate` | opaque registered canvas | `CLEAN_PLATE_ONLY_NO_CONTAINER` | `clean-plate-clear` |
| `canonical-frame` | real alpha or declared chroma key | `CANONICAL_FRAME_ONLY_NO_CONTENTS` | `canonical-frame-only` |
| `content-state-sheet` | real-alpha grid, each cell one complete internal state | `CONTENT_STATES_ONLY_NO_CONTAINER_FRAME_OR_EXTRA_SURFACE` | `container-content-only`, `container-state-separation`, `container-fill-progression` |

The content sheet must not redraw the bottle, bezel, background, label, rim, or
an extra isolated surface strip. Each cell contains only the complete internal
contents for that state on one registered cell canvas. Record the provider
roots unchanged before local processing.

Every root repeats the compiler-owned `interiorShape`, `alignmentPolicy`,
`sheetLayout`, ordered states, `terminalStateId`, and `terminalPolicy` in its
`containerPackageBinding`. These are mechanism inputs, not free prompt prose.

Validate each request before spending a provider attempt:

```bash
npm run provider:request -- validate --request=projects/<slug>/requests/<asset>.json --json
```

## Deterministic Derivation

Author one schema-v1 spec against
`schemas/canonical-container.schema.json`, then run:

```bash
npm run assets:derive-canonical-container -- projects/<slug>/canonical-containers/<family>.json
```

The derivation command:

1. verifies current hashes and real alpha on the frame and content sheet;
2. extracts exact state cells without trimming;
3. measures each content silhouette;
4. center/bottom-aligns it only within the authored repair envelope;
5. clips every state through the same polygon interior mask;
6. records translation, center drift, bottom gap, fill level, rim gap, interior
   retention, clipped pixels, bottom-band coverage, and outside-mask pixels;
7. rejects a state that still violates the thresholds;
8. rejects a terminal state that does not visibly reach the declared target;
9. appends lifecycle-safe local derivative records and one family fingerprint;
10. optionally patches the pre-authored three-slot runtime group.

The group has exactly these visible children in this fixed paint order:

1. `container-clean-plate`;
2. `container-contents`;
3. `container-frame`.

All three keep the full registration canvas and have no independent motion.
The parent group owns any whole-prop movement. Only the contents child may
declare `container-surface:<authoritativeSurfaceId>`. A second water, waterline,
fill, or synonymous surface consumer with that authority is a validation error.

## Recovery

Try deterministic splitting, alignment, and masking again first. If pixels are
actually wrong, keep the complete current content sheet in provider context and
edit only a mask inside that sheet. Prove untargeted cells unchanged. If that
cannot be guaranteed, regenerate the complete content sheet.

Never generate one replacement fill state in isolation. Never repair a failed
state by adding another visible water-surface node.

## Proof and Review

Run:

```bash
npm run proof:canonical-container -- projects/<slug>/canonical-containers/<family>.json
npm run project:composition-proof -- <slug>
npm run project:quality -- <slug>
```

The deterministic proof produces:

- a mask overlay showing the single authored interior;
- the complete ordered state progression composited behind the same frame;
- a terminal-state panel with measured fill evidence.

Quality passes only when source hashes, manifest bindings, family fingerprint,
runtime members, state metrics, terminal metrics, and all three proof artifacts
are current. Human review still confirms that the intended physical mechanism
and visual craft read correctly; deterministic proof prevents independent
layer drift from being mistaken for a valid mechanism.
