# Arena visual system
- Three.js r170 loaded on demand from jsDelivr; actual procedural truncated-icosahedron football, cricket bat/ball and chess king/pawn models, PBR materials, generated reflection environment and interactive pointer rotation.
- Custom GLSL shader supplies atmospheric ribbons and sparks. Render loop pauses when offscreen or document hidden, user can pause motion; DPR capped. Reduced motion and WebGL failures show authored SVG illustrations.
- React and Framer Motion handle animated labels and controls. No Rive binary assets were provided; bespoke vector artwork and motion are used instead of pretending a Rive animation exists.
- Arena CSS applies the new palette, depth, glass nav, typography, cards, controls and gold icons across existing pages. Firebase and chess logic unchanged.
- Requires network access to pinned Three.js CDN for 3D. No model or texture downloads. Browser/GPU performance and mobile layout require visual QA.
