# Pen plotter — Anatomy Figure

One physical mechanism turns a continuous path into a drawing. The Y gantry carries the X carriage; the pen tip and the line endpoint always use the same normalized path model. The workspace is 180 × 110 mm; the path stays inside it. No WebGL is needed.

Parts, planned before geometry (76 solids):
- Base: chassis (1), foot pads (4), foot plinths (4), bed insert (1), paper sheet (1), corner clamps (4), ruler strip (1), label plate (1).
- Drive: side rails (2), end stops (4), motor cases (2), motor lids (2), cooling fins (10), vent slots (8), belt lanes (2), front control housing (1), button socket (1), push button (1).
- Gantry: rail shoes (2), bearing blocks (4), uprights (2), cross beam (1), belt strips (2), end covers (2), mounting screws (eight ring/dot marks).
- Tool head: carriage saddle (1), bearing pads (4), front bracket (1), clamp halves (2), cartridge (1), pen barrel (1), nib holder (1), tip (1), adjustment screw (1), knurl marks (eight).

Construction: bevelled, filled box solids, four facing tones, projected with Anatomy's kit at 42° azimuth / 32° elevation. Feet are sorted by depth; paper and ink sit below the moving gantry; the pen is painted last in front of the beam. Static paths are generated on the server; only group transforms and the ink dash offset change per frame. No pipes, tubes or cylindrical bodies.

Interaction: automatic 18-second trace, pointer scrub and Arrow/Home/End keyboard controls. Space pauses or resumes. The page presents the drawing without cards, headings, captions or controls. Animation pauses offscreen and in background tabs. Reduced motion starts at a still pose with manual controls.

Regenerate the geometry after construction changes: `node scripts/build-pen-plotter.mjs`.
