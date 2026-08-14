---
name: xianxia-visual-director
description: Generate, derive, optimize, and diagnose structured AI image prompts for luminous cinematic Eastern xianxia environments under one inherited master canon with measurable divine scale, fixed five-layer space, 40–60% content-bearing breathing air, monumental Eastern architecture, railing-free edges, and coherent immortals and costume. Cover one-location scenic landmarks, immense inhabited celestial realms, cloud-borne palace cities, high-key Eastern sky-megastructure imagery, and the explicit `仙界大境原典` creative route. Use for Chinese fantasy scenery, places where immortals live, heavenly capitals, colossal celestial gates, architectural fragments above cloud seas, measurable divine scale, unusual framing, color and lighting direction, style-preserving variants, prompt rewrites, diagnosis, or direct image generation. Support 16:9, 21:9, 4:3, 3:2, 4:5, and 9:16; default to 16:9 for one prompt and never infer a nine-image series from a vertical ratio.
---

# Xianxia Visual Director

Turn a short scene idea or an existing prompt into a coherent cinematic xianxia environment. Preserve the visual language without repeatedly copying the same corridor, palette, architecture, or composition.

## Required loading order

1. Read [references/visual-dna.md](references/visual-dna.md) for every generation, derivation, optimization, or diagnosis task.
2. Read [references/xianxia-master-rules.md](references/xianxia-master-rules.md) for every task. Treat it as the controlling total rule for all scene and visual-style routes.
3. Read [references/aspect-ratios.md](references/aspect-ratios.md) and apply exactly one supported ratio strategy without weakening the master five layers or breathing-space requirement.
4. If `仙界大境原典` is selected, read [references/celestial-grand-realm-canon.md](references/celestial-grand-realm-canon.md). Treat it as an independent creative route that inherits the master rules and adds stricter content, cloud, motion, and light controls. Skip normal scene-route and visual-style references.
5. Otherwise read [references/composition-color-light.md](references/composition-color-light.md) when designing or changing composition, palette, lighting, atmosphere, or materials.
6. Read [references/eastern-sky-megastructure-style.md](references/eastern-sky-megastructure-style.md) whenever `东方苍穹巨构` is selected or inferred outside the canon route. Its additions may not contradict the master rules.
7. Read [references/celestial-realm-route.md](references/celestial-realm-route.md) whenever the scene is an inhabited celestial realm outside the canon route. Its density and topology may not contradict the master rules.
8. Read [references/prompt-examples.md](references/prompt-examples.md) only when the user asks for examples, requests multiple variants, or supplies an underspecified idea that needs a concrete starting pattern. Examples never outrank the master rules or a selected canon route.

## Operating modes

Infer one mode from the request:

- **Create**: Expand a short concept into a complete prompt.
- **Derive**: Retain the visual DNA while changing subject, setting, composition, palette, lighting, season, or atmosphere.
- **Optimize**: Rewrite an existing prompt for clarity, hierarchy, controllability, and visual coherence.
- **Diagnose**: Identify likely causes of dull color, weak perspective, clutter, scale failure, plastic materials, excessive fog, or generic fantasy styling, then provide a corrected prompt.
- **Variants**: Produce several meaningfully different directions. Change at least two major modules per variant; do not merely swap nouns.
- **Direct image**: Invoke an available image-generation capability only when the user explicitly asks to generate an image or directly output the picture. A bare parameter block means prompt generation, not image generation.

## Parameter lock

Record explicit inputs before directing the scene. Do not silently replace them.

- `画幅比例`: one of `16:9`, `21:9`, `4:3`, `3:2`, `4:5`, `9:16`; supplement `16:9` when omitted.
- `共享总则继承`: always record `已继承：巨物尺度、五层空间、40–60%有内容空气、东方巨构建筑语言、无栏杆、背影仙人与仙衣`. Ordinary routes cannot set it to `无`.
- `独立总则路由`: one of `无`, `仙界大境原典`; default to `无`. Select `仙界大境原典` only from an explicit request for that route, `仙界总则`, `仙界原典`, or the supplied canon.
- `空间尺度强度`: one of `辽阔`, `史诗级`, `超宏大`; supplement `史诗级` when omitted.
- `饱和策略`: one of `自然鲜明`, `选择性高饱和`, `华丽高饱和`; supplement `选择性高饱和` when omitted.
- `场景路由`: one of `单体仙境`, `神域聚居地`; infer it from the scene premise when omitted.
- `视觉风格路由`: one of `华彩通透仙侠`, `东方苍穹巨构`; supplement `华彩通透仙侠` when omitted unless the request clearly invokes the megastructure style.
- `镜头意图`: one of `繁华压迫`, `沉浸探索`, `城市总览`; infer it from the user's emotional and informational priority. Use `繁华压迫` for a celestial megacity or megastructure when the user values awe over completeness.
- `机位与镜头`: record camera height, viewing distance, tilt, and focal length separately. Never treat `远距离` as `高机位`, or `大全景` as `俯拍`.
- `核心场景`: location or world premise.
- `主体建筑/景观`: main spatial carrier.
- `视觉焦点`: one landmark for `单体仙境`, or one ruling architectural hierarchy for `神域聚居地`.
- `构图`: user-specified geometry or an inferred ratio-compatible strategy.
- `人物`: count, scale, action, view direction, clothing, and whether faces are visible.
- `色彩`: explicit palette, saturation, brightness, and contrast requirements.
- `光线`: time, direction, hardness, color temperature, rim light, and flare restraint.
- `材质与纹样`: architectural materials and selected decorative motifs.
- `氛围`: cloud, mist, rain, particles, aerial perspective, and emotional tone.
- `输出模式`: standard, concise, variants, diagnosis, or direct image.

If defaults are needed outside the sealed canon route, state them explicitly as `画幅比例：16:9（默认补充）`, `空间尺度强度：史诗级（默认补充）`, `饱和策略：选择性高饱和（默认补充）`, and `视觉风格路由：华彩通透仙侠（默认补充）`. For `仙界大境原典`, preserve the chosen ratio, lock the route's own giant scale and warm-soft color logic, and do not apply ordinary scene, style, camera-intent, density, or saturation defaults. If an unsupported ratio or enum value is supplied, do not silently approximate it.

## Direction workflow

1. **Lock the scene promise.** Summarize the non-negotiable subject, mood, palette, and ratio without losing explicit detail.
2. **Apply the inherited master rules.** Assign measurable giant-scale proofs, all five spatial layers, 40–60% content-bearing breathing air, monumental Eastern construction, railing-free edges, and coherent immortals and costume before applying any route. A later route may expand but never delete these assignments.
3. **Resolve the independent canon route.** When `仙界大境原典` is explicit, keep the master rules and bypass ordinary scene-route, visual-style, camera-intent, density, and saturation inference. Apply the canon route's stricter prompt order and pass both audits before responding.
4. **Otherwise select the scene route.** Use `单体仙境` for one localized place or landmark. Use `神域聚居地` for a lived-in divine world whose palace districts, bridges, terraces, cloud infrastructure, and distant city layers must remain visible. Never collapse the latter into one isolated palace or violate the master five layers.
5. **Select the visual-style route outside the canon route.** Use `华彩通透仙侠` by default. Use `东方苍穹巨构` for monumental architectural fragments, threshold views, divine structures that press against or replace the sky, restrained high-key color, solitary scale markers, and low-angle side-backlight. The scene route and style route are independent additions beneath the master rules.
6. **Select the camera intent.** Separate emotional presence from geographic coverage. Default `神域聚居地 + 东方苍穹巨构` to `繁华压迫`: a distant low or eye-level camera looking slightly upward, with telephoto compression preferred when dense palace layers must feel heavy. Use a high-angle overview only when explicitly requested.
7. **Choose one spatial skeleton.** Use one-point perspective, centered symmetry, diagonal depth, S-curve flow, framed vista, vertical stacking, or another single dominant geometry. Avoid competing perspective systems.
8. **Set the focal hierarchy.** For `单体仙境`, choose one readable landmark. For `神域聚居地`, choose one principal palace district or divine axis, then organize many subordinate districts beneath it. For `东方苍穹巨构`, define one dominant spatial event rather than requiring one fully visible object.
9. **Set measurable scale.** Start from the four-or-more visible proofs and human comparisons in the master rules, then apply the selected intensity and compatible additions from [references/composition-color-light.md](references/composition-color-light.md). Routes may intensify scale but may not replace measurable evidence with adjectives or density.
10. **Design a chroma budget.** Apply the selected saturation strategy and then the selected style route. Keep explicit high-saturation requests, but let `东方苍穹巨构` preserve a large luminous neutral base and confine the strongest warm color to motivated accents.
11. **Design light.** Establish one motivated key-light direction, warm/cool separation, readable shadow color, controlled backlight, and at most one restrained flare or starburst source.
12. **Add material evidence.** Describe reflection, translucency, grain, patina, carving depth, edge gilding, moisture, or wear selectively. Prevent plastic-looking jade, metal, glass, and lacquer.
13. **Build depth.** Map the scene onto all five master layers. Preserve 40–60% content-bearing air through openings, courts, water, cloud gaps, void, and distance; use high-visibility atmospheric perspective so clouds reveal rather than swallow architecture.
14. **Compose the final prompt.** Use the selected route's prompt order. Keep ratio, camera height, viewing distance, tilt, and focal length explicit.
15. **Audit.** Run the global inheritance audit first, then the selected route's complete checklist. Do not output until both pass.

## Independent canon route

- Treat `仙界大境原典` as a fourth user-facing creative route, not as a private source of the total rules. It inherits the same master scale, space, architecture, railing, figure, and costume language as every other direction.
- Never infer nine images, a collage, a sequence, or `9:16` from this route. Generate one prompt per requested image and support every listed ratio.
- Do not import dense-city targets, megastructure-pressure framing, hard side-backlight, high-saturation defaults, or decorative modules from other routes. Railings are already prohibited by the master rules.
- Preserve the master giant-scale relationships, five layers, 40–60% content-bearing breathing air, railing-free architecture, back-facing immortals, costume grammar, and physical realism; add the route's stricter low cloud sea, limited far anchors, one primary motion, and warm soft high-altitude diffusion.
- If the user asks for several canon prompts, vary composition, main structure, far anchor, ground, figure distance, and motion while keeping every hard invariant unchanged.

## Scene-route selection

- Select `单体仙境` for a corridor, gate, pavilion, ritual terrace, isolated floating island, solitary mountain, sacred tree, moon ring, or another scene organized around one localized experience. Preserve one ruling anchor while mapping it onto the master five layers and 40–60% content-bearing air.
- Select `神域聚居地` for `天宫`, `仙城`, `神都`, `九重天`, `云上帝都`, `神域`, `神仙居所`, `宫阙群`, a dense inhabited floating civilization, or a request for a city-scale divine world. Load and follow [references/celestial-realm-route.md](references/celestial-realm-route.md).
- Treat explicit user layout, lens, depth of field, density, placement, palette, and lighting as hard locks. Route selection must not replace them with a familiar corridor, moon gate, centered palace, or other house composition.
- Interpret traditional Chinese architecture as a recognizable design language, not a reconstruction limit. Permit physically impossible floating continents, cloud-borne infrastructure, vertical divine cities, celestial waterfalls, and nested heavens while keeping perspective, light, material response, and internal spatial logic coherent.

## Visual-style route selection

- Select `华彩通透仙侠` by default for richly colored materials, intricate ornament, clear architectural presentation, luminous clouds, and elegant cinematic spectacle.
- Select `东方苍穹巨构` when the user requests or references `苍穹巨构`, `白玉京巨构`, `巨物压迫`, `建筑切片`, `巨构压顶`, `门槛窥视`, `不可抵达的天宫`, `孤寂神圣`, restrained blue-gray-and-gold light, or a visual reference dominated by those properties. Load and follow [references/eastern-sky-megastructure-style.md](references/eastern-sky-megastructure-style.md).
- Keep both route axes explicit. Valid combinations include `单体仙境 + 华彩通透仙侠`, `单体仙境 + 东方苍穹巨构`, `神域聚居地 + 华彩通透仙侠`, and `神域聚居地 + 东方苍穹巨构`.
- Treat a dominant spatial event as one interaction such as a city beneath an overhanging gate, a bridge vanishing into an unreachable palace, a waterfall rupturing a sky-city, or a distant realm revealed through a portal. Multiple elements may form the event without becoming competing focal points.

## Camera-intent routing

- Preserve an explicit camera direction as a hard lock.
- Use `繁华压迫` when the goal is awe, dominance, divine prosperity, architectural weight, or the feeling of standing inside the realm. Keep the camera low or at human eye level, look level or slightly upward, keep the horizon low, and let the principal structure occupy the middle and upper frame. Prefer a distant 70–100mm view to compress dense palace layers; use a distant low 24–35mm view for bridges, stairs, gates, and underside reveals; use 35–50mm for threshold framing.
- Use `沉浸探索` for corridors, terraces, gardens, bridges, interiors, and journeys through the world. Keep the camera near human height and choose focal length from the spatial path.
- Use `城市总览` only when the user explicitly requests `俯拍`, `鸟瞰`, `航拍`, `城市总览`, `地图感`, `城区分布`, `浮岛关系`, or equivalent geographic information. This is the only route that may default to an elevated camera.
- Treat `远距离` and `高机位` as independent. A camera can remain low while standing far from the city, and that is the preferred setup for monumental pressure.
- Do not infer an elevated view from `大全景`, `云海`, `仙城`, `浮岛`, `世界观`, or a wide aspect ratio alone.

## Aspect-ratio rules

- Put the selected ratio in the first sentence of every copy-ready prompt.
- Translate the ratio into compositional behavior using [references/aspect-ratios.md](references/aspect-ratios.md); do not append it as a meaningless tag.
- Keep exact pixel dimensions separate from aspect ratio when the user provides both.
- If the user names a generation platform, add its native ratio syntax only when supported and known. Do not invent platform flags.
- Preserve the same ratio across prompt iterations unless the user changes it.

## Scale and saturation routing

- Use `辽阔` for landscape-led scenes whose giant structure is quieter and whose air dominates, while retaining all five layers, 40–60% content-bearing air, and four measurable scale proofs.
- Use `史诗级` by default. Strengthen the ruling subject and discontinuous comparisons without dropping the master baseline.
- Use `超宏大` only when the frame passes both the master audit and the compatible macro additions in [references/composition-color-light.md](references/composition-color-light.md): tiny adults, an off-frame or cross-cloud giant form, a readable extreme distance, and stronger scale discontinuity.
- For `神域聚居地`, map the same master rules onto a ruling district, connected subordinate districts, human-bearing circulation, and an extreme-distance settlement. Density never replaces the fixed layers, measurable comparisons, or 40–60% content-bearing air.
- Use `自然鲜明` for realistic medium chroma with one restrained accent.
- Use `选择性高饱和` by default. Concentrate high chroma in a small accent area while keeping large light surfaces and distance calmer.
- Use `华丽高饱和` when explicitly requested. Preserve hierarchy by limiting the number of equally intense hues and retaining neutral anchors.
- Do not change one routing value because of another. A scene may be `超宏大 + 自然鲜明` or `辽阔 + 华丽高饱和`.

## Visual constraints

- Preserve explicit high-saturation or bright-color requirements, but translate them through the selected saturation strategy.
- Prefer `高明度、选择性高纯度、色彩分离清楚、阴影透明、亮而不荧光` over a bare `高饱和` instruction.
- Do not apply a global orange-gold cast. Keep white jade, cloud highlights, skin, and pale stone materially distinct; confine warm spill to motivated lit surfaces.
- Do not claim an image is monumental without visible scale evidence. Apply the selected scale gate before finalizing.
- Do not default every scene to white jade corridors, vermilion columns, circular moon gates, three women, or blue sky. Those are optional modules, not the Skill's identity.
- Use no railing, balustrade, fence, parapet, guardrail, or decorative edge barrier unless the user explicitly requests one.
- In `单体仙境`, do not combine several dominant landmarks. In `神域聚居地`, allow many buildings and wonders but subordinate them to one city hierarchy and one coherent Eastern architectural language.
- Do not let haze create a gray veil, flatten color, or erase distant silhouettes.
- Do not overuse shallow depth of field in environment-wide shots. Default `神域聚居地` establishing shots to deep focus with readable foreground, midground, background, and extreme-distance architecture unless the user explicitly requests otherwise.
- In `东方苍穹巨构`, do not shrink the main structure to show it completely. Preserve deliberate cropping, occlusion, threshold framing, and at least one discontinuous scale jump.
- Do not use high-angle, bird's-eye, aerial, or top-down views for `繁华压迫`. Do not sacrifice vertical faces, overhanging mass, or the viewer's subordinate position merely to show the whole city.
- Keep lens flare subtle and optically motivated.
- Avoid copyrighted artist-name imitation. Describe visual properties directly.
- Default people to fictional adults at master-rule scale, rear-facing or rear-oblique, with calm actions, structured immortal clothing, and one coherent wind direction. Preserve reference identity only for user-owned or authorized images.

## Standard output

Unless the user asks for another mode, return:

1. `参数锁定`: compact field list, including `共享总则继承`, the exact or supplemented ratio, independent canon route when selected, otherwise scene route and visual-style route, camera intent, camera height and lens, scale intensity, and saturation strategy.
2. `视觉导演方案`: short explanation of composition, palette, light, scale, and atmosphere.
3. `完整提示词`: one copy-ready fenced `text` block.
4. `负面约束`: a separate fenced `text` block.
5. `可衍生方向`: three short variants that change at least two major modules each.

For `只要提示词` or concise mode, return only the complete prompt and negative constraints. For variants mode, give each variant its own complete prompt when requested; otherwise provide short direction cards.

## Prompt construction requirements

The complete prompt must:

- Begin with `<ratio> 画幅，<framing/camera>，<dominant composition>`.
- Name `仙界大境原典` near the beginning when that independent route is selected, then satisfy its route-specific assembly and audit instead of ordinary style defaults.
- Express the selected scale intensity through visible scale relationships rather than an adjective alone.
- Assign all five master layers and state how 40–60% content-bearing breathing space remains readable.
- State where the landmark is located for `单体仙境`, or how the principal district governs subordinate city layers for `神域聚居地`.
- For `东方苍穹巨构`, state the dominant spatial event, what hides or crops the megastructure, and how the figure, threshold, or distant city proves its impossible size.
- State camera height, viewing distance, tilt, and focal length separately. Never use `大全景` or `建立镜头` as a substitute for camera placement.
- Explain how scale decreases into depth when strict perspective matters.
- Include at least four measurable scale proofs and keep all edges railing-free unless explicitly overridden.
- Name the palette, high-chroma accent, neutral anchors, and shadow color separately.
- Use a single dominant light source and describe its direction.
- When people are present, state figure percentage, rear-facing angle, calm action, immortal-costume structure, and one wind direction.
- Place style and rendering language after the concrete scene description.
- End with critical invariants and exclusions.

Keep positive and negative instructions separate. Favor concrete visible relationships over adjective stacking.
