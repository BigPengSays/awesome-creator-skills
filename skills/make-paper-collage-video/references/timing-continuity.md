# Timing Continuity Contract

Read this after real narration exists, when authoring tails or an intentional quiet beat, or when `duration-content-deficit`, `scene-tail-budget`, or `audiovisual-coverage` fails.

## Choose the Duration Authority

| Requested duration | Authority after narration sync | Required behavior |
|---|---|---|
| Not supplied | Measured narration, bounded tails, transitions | Let the execution duration shrink or grow; never restore the estimate with padding |
| Supplied | Human target | Block a deficit or overflow outside tolerance; revise content or obtain a new duration decision |

`project:sync` measures every narration file. For an inferred duration, it also caps unexplained `tailSeconds` before subtitles and validation. The initial plan remains provenance, while `validation.timeline` is the real execution length.

Subtitle cue ranges use the measured narration window. Sentence segmentation
keeps Chinese closing quotes/brackets with the preceding punctuation. Default
cue gaps may leave brief reading separation, but ordered cues must cover at
least 80% of narrated frames. Cues shorter than three frames render fully
opaque; longer cues use a fade no greater than half their usable duration.
When visible subtitles intentionally omit punctuation, retain single spaces in
`narration.text` at semantic phrase boundaries. The subtitle derivation keeps
those spaces on screen, prefers them as cue breaks, balances unpunctuated text
instead of leaving one- or two-character tail cues, and defaults to at most 18
non-space characters per landscape cue or 16 per portrait cue.

`project:plan --json` exposes this choice as `decision.durationAuthority`: `human-target` for an explicit duration and `content-derived` otherwise. Copy it into concept `planDecision`; do not describe an inferred estimate as a locked delivery target.

## Keep Tails Technical

- Ordinary scene tail: at most 1.2 seconds.
- Final scene tail: at most 1.8 seconds.
- Use tails for easing, subtitle clearance, and transition safety, not to meet a target runtime.
- Add narration, a visible beat/event, an approved sound passage, or shorten an explicit target when content is missing.

An intentional quiet observation may extend the allowed tail only through a `hold` event that:

- represents an approved storyboard beat;
- targets `scene` with `visual.kind=hold`;
- binds `proofTimeId` to the state the viewer must inspect;
- starts next to the narration boundary when it extends the tail;
- lasts no more than 2.5 seconds.

The runtime exempts only the exact declared interval. An unbound, delayed, or overlong hold does not authorize padding.

## Judge the Rendered Union

`project:assets-ready` can enforce tail, hold, and explicit-duration rules, but it cannot claim audiovisual coverage before a video exists. `project:preview` and `project:render` invoke the final report, which analyzes the artifact rather than trusting authored configuration:

```text
dead air = detected silence ∩ sampled low motion − approved hold windows
```

- Warn at an unapproved overlap of 0.8 seconds.
- Fail at a continuous overlap of 1.2 seconds.
- Fail when all unapproved overlaps exceed 8% of the film.
- Map every interval to scene id and absolute start/end seconds in `continuityAnalysis`.

Silent animation is valid. Static imagery with narration is valid. Background music is optional and must not be introduced merely to defeat detection. Fix false positives by improving meaningful motion/audio or by declaring a real observation beat; do not add noise, flicker, or imperceptible drift.

## Failure Routing

- `scene-tail-budget`: reduce the tail or author a real proof-backed hold.
- `duration-content-deficit`: add narrative coverage or revise the explicit duration with human approval.
- `audiovisual-coverage`: this is a post-render failure; inspect `report.json.continuityAnalysis.perScene`, repair the named interval, and rerender.
- A legitimate quiet beat rejected by the report: verify the hold target, `visual.kind`, proof binding, duration, and exact window.
