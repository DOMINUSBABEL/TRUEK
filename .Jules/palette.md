## 2025-03-09 - Accessibility of Icon-Only Buttons
**Learning:** This application heavily utilizes custom icon-only buttons (using `lucide-react`) across key views (e.g., layout navigation, adding an item, item details). By default, these buttons lacked proper ARIA labels and keyboard focus states (`focus-visible`), which makes the experience poor for screen reader users and keyboard navigators.
**Action:** When working on future components or refining existing ones in this design system, always ensure that any icon-only button is accompanied by an `aria-label` (localized in Spanish per conventions) and explicitly receives focus states (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).
## 2024-05-18 - Tailwind SR-Only Toggle Accessibility
**Learning:** Custom toggle switches using the Tailwind `.sr-only peer` pattern often lack proper keyboard focus indicators and descriptive text linkage.
**Action:** When creating or modifying a `.sr-only peer` toggle, always ensure:
1. The wrapping `<label>` has `htmlFor` matching the hidden input's `id`.
2. Any separated descriptive text uses an `id` that is referenced by the input's `aria-describedby`.
3. The visual indicator element (often the sibling `<div>` following the input) explicitly includes `peer-focus-visible` styling (e.g., `peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary`) so keyboard navigators know they have focus.
