# Ruoshui Deng - painted ocean portfolio

Next.js, React, TypeScript, GSAP ScrollTrigger and CSS ambient animation.

Run npm install, then npm run dev. npm run build exports the website to out/.

The six supplied paintings in public/paintings are unchanged originals. Order: sunset, complete butterflyfish school, lionfish, peppermint angelfish, opah, shark with all pilot fish. Responsive images preserve their whole compositions. Background colors blend between paintings. Clicking each artwork opens its portfolio panel.

The sunset uses a softly masked moving water layer, reflected-light animation and sun glow. Pause and reduced-motion settings stop ambient motion.

Edit components/Journey.tsx for interaction, app/globals.css for transitions and animation, and data/portfolio.ts for CV content. Previous assets are retained but no longer displayed. No external deployment was performed.

## Local composition editor

Use the pencil icon to edit, and the checkmark to return to viewing. Each scene has icon controls: framed square = replace background, plus = add a fish PNG/WebP, down arrow = export composition JSON, up arrow = import. Select a fish to resize with the slider or remove with the cross. Drag to position; arrow keys also move selected fish. Upload fish with a transparent background: their alpha channel determines pointer hit testing. An opaque image is clickable throughout its opaque area.

Compositions are saved in this browser's IndexedDB, not to the source folder or a hosted service. Export a JSON backup before changing browsers or clearing browser data. Import it into the corresponding scene to restore. Each scene's fish open the existing portfolio content for that scene. Background replacements disable the old painting's outline hotspots. Existing baked-in paintings retain manually traced fish-only SVG hotspots; artwork text labels are removed.
