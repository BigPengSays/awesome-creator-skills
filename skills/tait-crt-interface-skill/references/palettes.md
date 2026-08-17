# Palette Registry

Use this registry for the intake question, prompt compilation, profile-appropriate delivery, and quality validation. Hex values are lowercase canonical values.

The authoritative visual selection card is `../assets/tait-crt-interface-color-card.png`. When palette is missing, `codex-full` resolves that path relative to this Skill and renders the image before asking; `portable-direct` must not resolve or render the asset and uses the compact text fallback below immediately.

| Reply name | Allowed colors |
|---|---|
| 经典 | `#dee4e0`, `#2e382d` |
| 粉黛 | `#f2d1d7`, `#7a3f43` |
| 极客01 | `#f2fcf6`, `#485446`, `#111e16`, `#13f81f` |
| 极客02 | `#e8e5df`, `#2ca770`, `#0d3d2d`, `#3e6a9e` |
| 复古01 | `#efca54`, `#5d9f58`, `#e870a1`, `#bbb8a5`, `#49473c` |
| 复古02 | `#e5e2be`, `#ef8a45`, `#317e50`, `#8e6442`, `#35342f` |
| 游戏01 | `#22e6da`, `#fabf37`, `#e90cbe`, `#2a4ac5`, `#1d2c6b` |
| 游戏02 | `#e7f5fe`, `#7bd699`, `#3bc4c4`, `#c97979`, `#29383a` |
| 如图 | Derive 2-5 colors from the uploaded reference's visual style, atmosphere, and emotional tone. |

## Palette Question

In `codex-full`, after displaying the bundled card, ask only:

`请选择色卡，请直接回复卡片名称；如需根据上传图片创作 2–5 色，请回复“如图”。`

If the card image cannot be rendered in `codex-full`, or whenever the profile is `portable-direct`, use this text fallback:

`请选择色卡：经典（#dee4e0 / #2e382d）、粉黛（#f2d1d7 / #7a3f43）、极客01（#f2fcf6 / #485446 / #111e16 / #13f81f）、极客02（#e8e5df / #2ca770 / #0d3d2d / #3e6a9e）、复古01（#efca54 / #5d9f58 / #e870a1 / #bbb8a5 / #49473c）、复古02（#e5e2be / #ef8a45 / #317e50 / #8e6442 / #35342f）、游戏01（#22e6da / #fabf37 / #e90cbe / #2a4ac5 / #1d2c6b）、游戏02（#e7f5fe / #7bd699 / #3bc4c4 / #c97979 / #29383a），或回复“如图”由 Skill 根据上传图片创作 2–5 色。请直接回复名称。`

Do not append the ratio question or any generation commentary in this turn. Do not substitute an older color-card image.

## Color Roles

- Sort the resolved palette by perceived luminance. Use the lightest and darkest colors as the primary contrast pair and, only when structurally necessary, as the checkerboard endpoints.
- Remaining colors are flat accents or secondary planes, not gradients. Prefer meaningful clusters over equal random distribution.
- Prefer bold solid-color plane separation. Checkerboard is optional, compact, and limited to non-skin curved surfaces or ambiguous plane contacts; never place it on a face or exposed skin, use it decoratively, or require a minimum area.
- `如图` must still contain a clear light/dark contrast pair. Consolidate near-duplicates and stop at five colors.
- Use only listed or derived palette colors in final content. CRT bloom, scanlines, misregistration, and persistence remain palette-bound.
- Polarity is a Variation Engine choice unless the user specifies it. The selected palette never implies a fixed positive or negative polarity.
