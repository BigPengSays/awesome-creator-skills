# Editorial System v9

Read this when authoring audio edit points, reusable typography, explanatory annotations, data SVG, responsive directing, or advanced editorial transitions.

## One Timing Authority

`editorial.media[]` binds every timing source to a final local audio file with `src`, SHA-256, measured duration, timeline mode, and—when detected cues are used—a timing-data JSON bound to the same SHA-256 and duration. Non-manual cues use `timingBasis=actual-audio`; a manual cue uses `source=authored` and `timingBasis=manual`. Never claim final alignment from estimated narration duration, TTS token latency, or a provider response timestamp.

Author word/phrase, sentence, semantic emphasis, SFX onset/peak/tail, music beat/bar/accent, and manual cues. Each cue declares priority and tolerance. `editPoints[]` groups cues and chooses `merge`, `highest-priority`, `offset-within-window`, or `reject`. The compiler emits distinct `mediaFrame`, `sceneFrame`, and whole-render `renderFrame`; runtime components consume those compiled frames and do not reimplement timing math.

Every scene-boundary, typography reveal/emphasis, graphic action, annotation lifecycle, data state, and advanced transition relationship is an explicit `bindings[]` record. Word reveal requires word cues. `wordTimingPolicy=phrase-fallback` is the only allowed explicit degradation when a phrase cue exists; `require` or `block` stops compilation.

## Reusable Editable Primitives

- `typography`: automatic single/multiline fit, min/max size, max lines, overflow policy, font stack, optional registered font file, stroke/shadow/pad, highlights, word/line/edit-point reveal, and edit-point emphasis. Keep reveal calculations in the shared timing primitive.
- `annotation`: arrow, leader line, label, badge, explainer card, callout, bracket, numeric counter, or percentage counter. Source and target are semantic node anchors. Use a full-canvas overlay transform and route around title, subtitle, motif, subject, and data exclusion zones.
- `data-graphic`: bar/column/line chart, comparison table, timeline, registered-geometry map, or simple flow diagram. Declare data, strict domain, formatting/units, progressive states, focus ids, and deterministic local SVG geometry. Empty, non-finite, out-of-domain, invalid-edge, and missing-region mappings are contract failures.
- `editorial-switch`: a panel family with ordered edit-point changes using `card-switch`, `panel-replace`, or `data-state`. It is a real switch primitive, not a stack of opacity-controlled copies.

Custom fonts must exist under `public/` and have a valid WOFF2, WOFF, OTF, or TTF signature. Missing files or extension/signature mismatches block project validation.

## Responsive Directing

Author all three `responsiveProfiles`: `16:9`, `9:16`, and `1:1`. Each profile owns dimensions, safe area, typography/parallax scale, exclusion zones, and density budget. Each scene owns semantic framing, crop focus, composition/typography profile, and placements with per-profile normalized overrides.

The authoring compiler emits three explicit directing plans. Materialize one selected plan into the Project before rendering. The shared layout primitive merges placement geometry with node anchors, recursively handles groups and switches, and is idempotent. Renderer code may apply the compiled plan but must not contain hidden aspect-ratio branches.

## Advanced Transitions

Use:

- boundary: `match-cut`, `graphic-match`, `shape-match`, `position-scale-match`, `color-value-match`;
- within-shot: `within-shot-card-switch`, `panel-replace`, `data-state-transition`.

Every transition declares semantic intent, source/destination anchors, source/destination match descriptors, requested match dimensions, edit point, continuity tolerance, invalid/fallback policy, and runtime treatment. Shape/color/value descriptors are compiler-visible in Storyboard; Project validation verifies them against the actual target nodes. Position and scale are checked for every responsive plan.

All five boundary match types require `treatment=hard-cut`. A crossfade, renamed fade, or alpha blend cannot satisfy a match cut. Formal proof includes before/at/after frames for every transition and reports each requested dimension separately.

## Proof and Quality

For a reusable system change, run:

```bash
npm run proof:phase2:prepare
npm run schema:v12
npm run proof:phase2:render
npm run proof:phase2:verify
```

The gallery uses only deterministic local WAV and SVG fixtures. It must output three previews, per-format and combined contact sheets, edit-point and responsive reports, transition before/at/after frames, typography fit/overflow, annotation collision/exclusion, chart/map/timeline, quality, directing-revision, full SHA-256 fingerprint, and verifier reports. Provider call count must remain zero.

Quality targets exist for typography, annotation, data graphics, advanced transitions, and non-empty responsive directing plans. A structural pass does not replace viewing the rendered proof frames; final production still needs its normal human style/preview judgments.
