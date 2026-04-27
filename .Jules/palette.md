## 2025-04-26 - Custom Tailwind Toggle Switch Accessibility
**Learning:** When using the `.sr-only peer` pattern for custom toggle switches, screen readers need explicit association, and keyboard users need visible focus. The disjointed text description must also be part of the label to increase the click area.
**Action:** Always wrap the visual slider and hidden input in a `<label>` with `htmlFor` matching the input's `id`. Add `peer-focus:ring-2` to the visual slider. Wrap any descriptive text in another `<label>` with the same `htmlFor` to expand the clickable zone.
