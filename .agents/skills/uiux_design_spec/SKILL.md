---
name: uiux_design_spec
description: UI/UX design specifications, design tokens, layout specs, loading & empty state rules, and accessibility standards following Google Antigravity design guidelines.
---

# UI/UX Design Specification Skill

This skill provides guidelines and patterns for creating rich, accessible, and dynamic visual interfaces across TaskFlow applications.

## 1. Design Token Architecture
- **Color Palettes**:
  - Primary / Brand: Indigo / Violet (`#4F46E5`, `#6366F1`)
  - Accent / Vibrant: Cyan / Teal (`#06B6D4`, `#0D9488`)
  - Dark Surface / Backgrounds: Slate / Zinc (`#0F172A`, `#18181B`)
  - Status Indicators:
    - Success: Emerald (`#10B981`)
    - Warning: Amber (`#F59E0B`)
    - Error / Danger: Rose (`#F43F5E`)
- **Typography Scale**:
  - Headings: `font-sans font-bold tracking-tight`
  - Body: `font-sans text-sm text-slate-300 leading-relaxed`
  - Code / Tokens: `font-mono text-xs`

## 2. Layout & Spacing Standards
- Consistent 8pt grid system (`gap-2`, `gap-4`, `gap-6`, `p-4`, `p-6`).
- Card Containers: Subtle glassmorphism gradients (`bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl`).
- Dynamic Hover Animations: Micro-scaling transitions (`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`).

## 3. Loading & Empty State Rules
- **Loading Skeletons**: Always render animated skeleton placeholders (`animate-pulse bg-slate-800 rounded-md`) while async queries resolve.
- **Empty States**: Never display blank screens. Present dedicated empty state components with illustrative icon badges, clear description text, and primary call-to-action buttons.

## 4. Accessibility & Contrast
- Maintain WCAG 2.1 AA contrast ratio (>= 4.5:1 for body text).
- Visible focus rings for keyboard navigation (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`).
