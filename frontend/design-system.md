# ATONIXCORP CLOUD — DASHBOARD DESIGN SYSTEM

Version 1.0 — Founder Specification (Samuel Realm)

Single source of truth for dashboard UI/UX implementation.

## 1. Introduction
AtonixCorp Cloud dashboard must deliver a GitHub/GitLab-level experience: clean, predictable, premium, and developer-centric.

## 2. Design Principles
- **Clarity:** every UI element has a purpose.
- **Predictability:** consistent patterns and behavior platform-wide.
- **Neutral First:** neutral palette for most surfaces; brand color only for emphasis.
- **Calm UI:** no heavy shadows or visual noise.
- **Developer Trust:** stable, precise, enterprise-grade interaction quality.

## 3. Layout System
### 3.1 Global Shell
- **Left Sidebar (fixed):** width `240–260px`, background `#FFFFFF` / `#F9FAFB`, right border `#E5E7EB`, icon `20–22px`.
- **Active nav item:** bold text, background `#F3F4F6`, left accent bar `3px` in brand color.

- **Top Bar (fixed):** height `56–64px`, background `#FFFFFF`, bottom border `#E5E7EB`.
- **Contains:** search, notifications, avatar, quick actions.

- **Main Content:** max width `1440px`, padding `32px`, responsive 12-column grid.
- **Vertical spacing:** `32px` between sections.

## 4. Color System
### 4.1 Neutral Palette
- Background: `#FFFFFF`
- Subtle Background: `#F9FAFB`
- Borders: `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#4B5563`
- Text Muted: `#6B7280`
- Icons: `#6B7280`

### 4.2 Brand Color
Primary brand color for interactive emphasis:
- Recommended: `#2563EB` (blue) **or** `#7C3AED` (purple)

Use brand color for:
- Primary buttons
- Active states
- Focus rings
- Links

Do **not** use brand color for:
- Body text
- Large card backgrounds
- Default icons

## 5. Typography
### 5.1 Font Family
- Inter (recommended)
- Mona Sans
- SF Pro
- Roboto (fallback)

### 5.2 Type Scale
- Page Title: `24–28px`, `700`
- Section Title: `18–20px`, `600`
- Card Title: `16px`, `600`
- Body: `14–15px`, `400`
- Metadata: `12–13px`, `300`

### 5.3 Line Heights
- Titles: `1.2`
- Body: `1.5`
- Metadata: `1.4`

## 6. Spacing
### 6.1 4-Point Grid
`4, 8, 12, 16, 20, 24, 32, 40, 48`

### 6.2 Vertical Rhythm
- Section spacing: `32px`
- Card internal spacing: `20–24px`
- Text block spacing: `8px`

## 7. Components
### 7.1 Buttons
- **Primary:** height `40px`, radius `6px`, brand background, white text, weight `500`.
- **Secondary:** height `40px`, radius `6px`, border `#D1D5DB`, white background, text `#111827`.
- **Destructive:** background `#DC2626`, hover `#B91C1C`.

### 7.2 Inputs
- Height `40px`, padding `0 12px`, border `#D1D5DB`, radius `6px`, white background.
- Focus ring `2px` brand color.
- Placeholder `#9CA3AF`.

### 7.3 Cards
- Border `#E5E7EB`
- Radius `8px`
- Padding `20–24px`
- White background
- No heavy shadow

### 7.4 Tables
- Header background `#F9FAFB`
- Row hover `#F3F4F6`
- Border `#E5E7EB`
- Text `14px`, metadata `12px`

### 7.5 Tabs
- Height `40px`
- Inactive `#6B7280`
- Active 2px underline in brand color
- `24px` spacing between tabs

### 7.6 Modals
- Width `480–640px`
- Padding `32px`
- Radius `12px`
- Subtle shadow

### 7.7 Toasts
- Position top-right
- White background, border `#E5E7EB`
- Subtle shadow
- Padding `16px`, radius `8px`

## 8. Interaction
- Hover: subtle shift only.
- Focus: always visible 2px brand ring.
- Micro-animations: `120–180ms` (`fade`, `slide`, tab underline).

## 9. Empty States
Structure:
1. Optional icon/illustration
2. Title
3. Description
4. Primary action

Example:
> No deployments yet
> Deploy your first container to see logs, metrics, and status here.

## 10. Skeleton Loading
Use skeleton placeholders over spinners.
- Background `#E5E7EB`
- Pulse animation
- Radius `4px`

## 11. Status Colors
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Idle: `#9CA3AF`

## 12. Navigation Structure
Sidebar items:
- Dashboard
- Deployments
- Pipelines
- Containers
- Kubernetes
- Monitoring
- Logs
- API Keys
- Storage
- Domains
- Billing
- Settings

## 13. Page Blueprints
### 13.1 Overview Page
- Page title
- Summary cards row (4 cards)
- Tabs: Overview / History / Settings
- Content sections (table/cards)
- Activity timeline

### 13.2 Deployments Page
- Summary cards: total, active, status, avg build time
- Tabs: Overview / History / Environments / Settings
- Sections: recent deployments table + timeline

## 14. Accessibility
- Keyboard navigation required
- Focus rings mandatory
- Minimum contrast ratio: `4.5:1`
- Screen reader labels for icon-only controls

## 15. Branding Guidelines
- Use brand color sparingly
- Avoid gradients
- Avoid heavy shadows
- Keep visuals clean, modern, enterprise-grade

## 16. Development Checklist
- Typography installed
- Color system applied
- Spacing system enforced
- Layout shell implemented

---

This design system is versioned and must be updated whenever new components/patterns are introduced.
