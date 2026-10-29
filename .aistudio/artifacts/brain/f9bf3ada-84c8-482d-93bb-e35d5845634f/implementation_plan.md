# Implementation Plan: Google Merchant Center Product Sync

## Overview
Modify the `DataManagement` tool to export product data in the exact format required by the Google Merchant Center CSV specification, and implement an automatic sync to a user-provided Google Sheet.

## Technical Tasks

### 1. Define Google Merchant CSV Structure
- Create a mapping between our internal Firestore `products` collection schema and the required Google Merchant Center CSV columns (id, title, description, link, image_link, price, brand, etc.).

### 2. Implement Data Formatter
- Create a utility function that transforms internal product objects into the flat array structure expected by the Google Merchant Center feed.
- Ensure all mandatory fields from the provided CSV sample are included and populated.

### 3. Update Data Management UI
- Add a new "Sync to Google Merchant Sheets" action to the `ProductManagement` section within `DataManagement.tsx`.
- Include a field for the user to input their Google Sheet ID.

### 4. Implement Server-Side Sync Logic
- Use the existing `/api/sync-sheets` backend endpoint to handle the Google Sheets API interaction.
- Ensure the backend receives the formatted data, authentication tokens, and the user-specified Sheet ID.

## Verification
- Run `lint_applet` and `compile_applet`.
- Verify in the UI that the product export generates the correct column headers and follows the specified data format.
- Test the "Sync to Google Sheets" button with a valid Sheet ID.
