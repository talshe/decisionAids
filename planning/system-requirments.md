# System Requirements

## Product Goal
- Build a decision-aid SaaS platform that helps customers choose the most appropriate treatment for their issue.
- The product must work well on both desktop and mobile devices.

## User Types
- Guest users can access the platform and view decision aids without creating an account.
- Guest users must not be allowed to fill out forms, submit responses, or trigger dynamic behavior within a decision aid.
- Authenticated users can sign in using Google, Facebook, Microsoft, or Apple.
- Admin users can manage decision aids and assign them to users.

## Core User Capabilities
- The system must include an `Explore` screen where users can browse and search available decision aids.
- Authenticated users must have a `My Decision Aids` page.
- The `My Decision Aids` page must show:
  - Decision aids assigned by an admin.
  - Decision aids the user has saved or favorited.
- Users must be able to open and complete a decision aid through a guided experience.

## Decision Aid Experience
- A decision aid must be presented as a multi-step flow made up of multiple pages or stages.
- Each step may include informational content, questions, or both.
- The system must support collecting user input through reusable form components, including:
  - Checkboxes
  - Radio buttons
  - Text areas
  - Draggable numeric scales or sliders
- These components should be designed for strong usability, accessibility, and a polished UI on both desktop and mobile.
- For guest users, decision aids must be displayed in a view-only mode.
- In view-only mode, guests can read the decision-aid content, but all form controls and dynamic interactions must be disabled or hidden.

## Administration
- The system must include an admin area or admin role.
- Admins must be able to create, manage, and assign decision aids to users.

## Current Project Scope
- There are currently no decision aids in the system.
- The current phase is focused on building the project skeleton and core infrastructure needed to support future decision aids.

## Initial Platform Requirements
- Set up the application foundation for authentication, user roles, admin capabilities, and decision-aid delivery.
- Design the system so decision aids can be added later without major architectural changes.
- Establish a reusable component system for the decision-aid flow and data-entry interactions.
- Provide a searchable discovery experience so users can find relevant decision aids from the `Explore` screen.

## Deployment Requirements
- The system must be deployable using infrastructure as code.
- The deployment target must be Google Cloud, Firebase, or a compatible combination of both.
- Infrastructure configuration should be designed to support repeatable setup across environments.

## Quality Expectations
- The UI must be responsive and mobile-friendly.
- The UX must be simple, clear, and guided, especially for multi-step flows.
- Shared components should be consistent, reusable, and easy to extend.
