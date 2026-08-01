---
name: tailwind_shadcn_ui
description: Styling guidelines and component implementation using Tailwind CSS v3 and shadcn/ui primitive components.
---

# Tailwind CSS & shadcn/ui Component Skill

This skill governs styling patterns, theme customization, and component primitives across TaskFlow frontend applications.

## 1. Design System Primitives (`shadcn/ui`)
- Use shadcn/ui component primitives for dialogs, modals, drawers, buttons, inputs, badges, and dropdown menus:
  - `Button`: Variant-driven (`default`, `destructive`, `outline`, `ghost`).
  - `Badge`: Priority and status indicator tags.
  - `Dialog` / `Modal`: Accessible overlays with portal rendering.
  - `Drawer`: Sliding sidebar components (e.g. Activity Log Audit Trail).

## 2. Utility-First CSS Practices
- Combine class names using the `cn()` helper utility (`clsx` + `tailwind-merge`).
- Avoid arbitrary, uncoordinated inline pixel overrides (e.g. `style={{ width: '127px' }}`); utilize standard Tailwind design tokens.
- Dark theme default: Enforce dark mode color palettes (`bg-slate-950`, `text-slate-100`, `border-slate-800`).

## 3. Responsive Component Layouts
- Mobile-first breakpoint design (`sm:`, `md:`, `lg:`, `xl:`).
- Grid and Flexbox orchestration (`grid grid-cols-1 md:grid-cols-3 gap-6`).
