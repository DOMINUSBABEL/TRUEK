## 2025-03-09 - Accessibility of Icon-Only Buttons
**Learning:** This application heavily utilizes custom icon-only buttons (using `lucide-react`) across key views (e.g., layout navigation, adding an item, item details). By default, these buttons lacked proper ARIA labels and keyboard focus states (`focus-visible`), which makes the experience poor for screen reader users and keyboard navigators.
**Action:** When working on future components or refining existing ones in this design system, always ensure that any icon-only button is accompanied by an `aria-label` (localized in Spanish per conventions) and explicitly receives focus states (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).## $(date +%Y-%m-%d) - Custom Toggle Switch Accessibility
**Learning:** Custom Tailwind toggle switches implemented with the `.sr-only peer` pattern often lack proper labeling and keyboard focus visible states. In `AddItem.tsx`, the "Barter Auction" toggle was wrapped in a label but the text was a disjointed `<h4>`, and the visual toggle lacked focus indicators.
**Action:** When working with custom toggle switches, always ensure the visual toggle component (e.g., the styled `div` next to the `peer` input) receives `peer-focus:ring-2` to support keyboard navigation. Additionally, convert descriptive text into `<label htmlFor="id">` to ensure screen reader association and expand the click target.

## $(date +%Y-%m-%d) - Bilingual UI ARIA Context
**Learning:** The application uses a mix of Spanish and English. When adding or updating `aria-label`s (especially for icon-only buttons like those in `AddItem.tsx`), it's easy to default to Spanish. However, screen readers read the labels in the context of the surrounding UI language.
**Action:** Always verify the language of the immediately surrounding text/headings in the component. If the section is in English (e.g., "Take a photo or generate"), ARIA labels (e.g., "Take photo", "Remove image") must also be in English to prevent screen reader jarring.

## $(date +%Y-%m-%d) - Form Element Association
**Learning:** Forms in this project (like `AddItem.tsx`) sometimes use `<label>` tags adjacent to `<input>`/`<select>` tags but forget the critical `htmlFor` and `id` linking attributes.
**Action:** Always explicitly link every `<label>` with its corresponding form field using `htmlFor` and `id` pairs to ensure accessibility and enlarge the clickable area, especially on mobile devices.
