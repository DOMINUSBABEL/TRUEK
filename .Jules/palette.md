## 2025-03-09 - Accessibility of Icon-Only Buttons
**Learning:** This application heavily utilizes custom icon-only buttons (using `lucide-react`) across key views (e.g., layout navigation, adding an item, item details). By default, these buttons lacked proper ARIA labels and keyboard focus states (`focus-visible`), which makes the experience poor for screen reader users and keyboard navigators.
**Action:** When working on future components or refining existing ones in this design system, always ensure that any icon-only button is accompanied by an `aria-label` (localized in Spanish per conventions) and explicitly receives focus states (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).

## 2025-04-28 - Explicit Form Label Association
**Learning:** Form structures in this app often wrap labels and inputs inside standard `<div>` elements without explicitly associating them. While visual users can intuitively map the text above an input to the field itself, missing `id` and `htmlFor` attributes break screen reader functionality and prevent clicking the label text to focus the target element, degrading usability.
**Action:** Always map `<label>` tags explicitly to `<input>`, `<select>`, and `<textarea>` components by assigning a unique `id` to the control and setting the corresponding `htmlFor` on the label to improve click area and screen reader context.

## 2025-04-28 - Custom Toggle Accessibility
**Learning:** Custom toggle switches using the Tailwind `.sr-only peer` pattern require specific HTML structures to be fully accessible. Without explicit `htmlFor` mappings to a hidden `id` input, keyboard focus tracking (`peer-focus`), and `aria-describedby` logic for disconnected descriptive text, the element becomes invisible or difficult to operate for disabled users.
**Action:** Ensure all `.sr-only peer` pattern implementations properly link the `<label htmlFor="id">` around the control, bind disjointed descriptive `<p>` elements using `aria-describedby`, and provide keyboard visibility via `peer-focus:ring-2 peer-focus:ring-primary`.
