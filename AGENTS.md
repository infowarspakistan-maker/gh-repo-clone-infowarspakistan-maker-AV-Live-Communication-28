# AV Live Classified Systems Modification Policy

This document defines the strict software modification policies that all AI Coding Agents must adhere to when updating, maintaining, or extending any system already in place and working within the AV Live Classified Workspace.

## Core Rules for Modifying Active Systems

### 1. Mandatory Read-Before-Write (No Assumptions)
- **Rule**: Never overwrite or replace any existing file without fully reading it first.
- **Goal**: Prevent regression and loss of custom features, hooks, states, or styles that have been integrated in previous steps.

### 2. Backward Compatibility & Preservation of State
- **Rule**: Ensure that all preexisting entity models, form inputs, database fields, or component properties (such as Active Status, Featured configuration, and custom rich text fields) are preserved.
- **Goal**: No functionality, field, or UI element should be "lost" or deleted unless explicitly requested by the user.

### 3. Iterative, Surgical Updates
- **Rule**: Prefer smaller, surgical code edits over complete file replacement. Use targeting edits (`edit_file` or `multi_edit_file`) rather than recreating the file (`create_file` with `Overwrite: true`) unless building a brand-new component from scratch.
- **Goal**: Minimize risks of compilation or integration errors on a complex live system.

### 4. Verification Workflow
- **Rule**: After making any changes, the agent must run the linter (`lint_applet`) and verify build success (`compile_applet`) before concluding.
- **Goal**: Maintain 100% up-time on dev environments.
