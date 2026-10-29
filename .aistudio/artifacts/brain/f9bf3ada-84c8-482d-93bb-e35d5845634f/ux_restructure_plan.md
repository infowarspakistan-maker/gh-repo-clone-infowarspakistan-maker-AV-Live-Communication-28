# UX Restructuring & Conversion Optimization Plan

## Problem Statement
The current homepage attempts to serve two distinct user intents simultaneously—corporate event planning and transactional hardware purchasing—resulting in high bounce rates and user confusion.

## Proposed Solution: The "Intent Split"
We will bifurcate the user journey immediately at the homepage.

### 1. New Homepage Structure (Bifurcated Entry)
- **Hero Split-Screen:** Upon landing, the user is presented with two clear, large call-to-action cards:
  - **Option A: "Corporate Event Solutions"** (Focus: Lead generation for Hybrid/Corporate events).
  - **Option B: "Professional AV Shop"** (Focus: Product catalog and hardware sales).
- **Reduced Homepage Complexity:** Remove the massive hero slider and multiple category list. Focus exclusively on driving the user into one of these two funnels.

### 2. Event Solutions Pathway (Primary Goal: Leads)
- **Streamlined Landing Page:** Replace the current service list with a high-impact page focused on:
  - Service benefits (Hybrid Events, 3D Holograms).
  - Prominent "Book Consultation" or "Get a Custom Quote" CTAs.
  - Social proof (Testimonials/Case studies) focused on corporate event success.

### 3. Hardware Shop Pathway (Primary Goal: Transactions)
- **Categorized Storefront:** Maintain the existing Shop, but ensure the navigation menu clearly separates it from the Event Solutions.
- **Simplified Navigation:** Ensure the main top-level menu prominently displays "Event Solutions" vs. "Hardware Shop".

## Plan of Action
1.  **Refactor `Home.tsx`:** Implement the split-screen landing UI.
2.  **Navigation Update:** Update `Navbar.tsx` to reflect the distinct pathways.
3.  **Content Migration:** Ensure all service-related content is exclusively routed through the "Event Solutions" pathway and product-related content through the "Hardware Shop".
4.  **Verification:** Test the funnel flow to ensure clear, friction-free conversion paths for both lead generation (events) and transactions (hardware).
