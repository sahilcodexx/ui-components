# Macro keypad — Anatomy Figure 02

A 12-key mechanical macro pad: a rectangular chassis, inset switch plate, sockets and housings, sprung stems and individual keycaps. Pressing a key moves its cap and stem down by 3.6 mm, exposes the actual travel on its SVG group and records its legend on the display. This is a companion to the pen plotter, not a replacement for its source.

Parts planned before geometry: case bottom (1), upper case (1), feet (4), foot plinths (4), PCB (1), switch plate (1), sockets (12), switch housings (12), stems (12), caps (12), front display bezel (1), display inlay (1), port shell (1), port opening (1), plate fasteners (4). Total: 68 solids. Screw rings, legends and grooves are surface markings. No cylindrical bodies, pipes or cables.

Four-tone shaded box construction, 42° azimuth and 35° elevation, projected by the vendored MIT Anatomy kit. Keys are sorted by depth. All key parts are prebuilt; only the cap/stem groups translate. Printed legends live in the plane of each cap. Display text is clipped to its actual window.

The spring model is time-based, bounded by physical stops, and independent of frame rate. Pointer, keyboard and the automatic tour share the same press/release path. Motion pauses offscreen and in background tabs. Reduced motion uses immediate press positions and no automatic tour.

Regenerate: `node scripts/build-macro-keypad.mjs`. Check: `node scripts/check-macro-keypad.mjs`.

Presentation: only the drawing is mounted, alongside the pen plotter. Escape clears input and restarts the automatic tour.
