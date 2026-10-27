# Generated lettering and shared page processing

The default `--text-mode image2` asks the local Agent's available image-generation tool to draw the exact Chinese caption together with each illustration. This is rendered lettering, not a generated TTF/OTF font. Tool availability depends on the host; an in-app tool may use a cloud service and is not a promise of offline inference.

## Generate

1. Prepare the plan with `--mode generate` (default generator `codex`). This writes jobs, not images. Preserve every story sentence and caption line break.
2. Read `codex-image-jobs.json`. Generate the character-reference job first, then scene jobs in order. Use the tool's real image-reference mechanism, not just filenames in the prompt. In Codex use the available `image_gen` tool with local `referenced_image_paths` after viewing those images; elsewhere use the equivalent installed image capability. Follow that tool's own Skill when applicable.
3. Scene masters are 1024×1536 (2:3), or a proportional higher resolution. Request the caption at y=0–342, a white gutter at y=342–512, and the illustration at y=512–1536. These are generation targets, not guaranteed pixel coordinates: inspect the actual gutter and keep the entire illustration inside visible white margins. If props or background reach the edge, edit/regenerate the framing. Character sheets are square. Final video is 1080×1440 (3:4); the master is contained, never stretched or cropped to fill.
4. Lettering follows the selected medium: felt-tip, crayon, pencil, pen or brush characteristics as appropriate. Do not substitute the bundled Ma Shan Zheng font. Explicitly render the requested Chinese string; no added labels, invented glyphs, or duplicated text.
5. View each actual master and compare its caption character by character with the manifest's `expected_caption`. Fix errors by editing/regenerating the master with the image tool, preferably just the caption region. Keep the correct illustration and margins. OCR, if available, is assistance rather than proof. If errors persist, disclose them; use `--text-mode font` only if the user explicitly chooses exact typeset text. That fallback uses system sans-serif and supports direct-cut mode only.
6. Place the approved actual image at `output_master`. Verify the tool's real output path; never create a placeholder image and describe it as generated art. For reference-driven styles compare line, palette, texture, shape and lettering with the source.
7. Run `--mode import`, then `--mode preview` or `--mode render` as requested. For `--mode full` with Codex, the Agent must complete generation, import and render; the planning CLI alone is not full completion.

## Shared post-processing

`scripts/page-assets.mjs` is used by uploaded pages, Codex imports and the explicit API generation path.

- **Direct cut:** preserve original master; extract caption as an image; contain/pad the artwork onto a 1024-square color plate; derive the aligned BW plate from that same color plate; reveal `text → bw_full → color` left to right. No second rendering of the caption as a font. Both generated and uploaded masters use observed ink/whitespace geometry to locate their caption/art gutter. Generated masters without a clear separation fail with an actionable error rather than silently losing part of the art. Uploads additionally support `--split-y` overrides.
- **Page flip:** preserve the untouched master, show it statically, then curl it from the bottom-right. Do not crop, rewrite its lettering, recolor it, create BW stages, or add a second caption. The page back retains faded original artwork.
- Reject wrong-aspect generated caption masters rather than silently cropping them. Preview upload auto-crops; use an explicit split if a long caption or dark paper confused detection.
- Import/FFmpeg does not recognize glyph correctness. Report caption inspection separately from deterministic checks.

The API route is opt-in (`--generator api` with `OPENAI_API_KEY`). It uses the same master specification and post-processor. Do not call it just because the built-in generation tool is missing.
