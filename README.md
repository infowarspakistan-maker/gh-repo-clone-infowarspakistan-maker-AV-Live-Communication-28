# AV Live Communications

Welcome to the AV Live Communications source code repository. This is a full-stack e-commerce and corporate services platform built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **E-commerce Storefront**: Browse products by category, apply filters (price, brand), and sort by newest arrivals, popularity, and price.
- **Custom Quote Requests**: Specialized B2B quote request system for corporate clients.
- **Service Pages**: Information on corporate events, hybrid events, esports organizing, and AI development.
- **Interactive Room Designer**: A tool for clients to design their meeting rooms and calculate AV requirements.
- **Admin Dashboard**:
  - Content Management (Homepage, About, Services)
  - Product & Inventory Management
  - Order & RMA (Return Merchandise Authorization) Management
  - Staff and Customer Management
- **Firebase Integration**: Utilizes Firestore for database storage, Firebase Authentication for user/admin login, and Firebase Storage for media.
- **SEO Optimized**: Automated sitemap generation on build for better search engine indexing.

## Technology Stack

- **Frontend**: React 19, React Router DOM, Tailwind CSS v4, Motion (Framer Motion)
- **Backend/Database**: Firebase (Firestore, Auth, Storage), Firebase Admin SDK
- **Build Tool**: Vite, ESBuild
- **Language**: TypeScript

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Firebase Configuration**:
   Ensure you have the `firebase-applet-config.json` file in the root directory. This file securely connects the web application to your Firestore database.

### Running the Development Server

To start the local development server:

```bash
npm run dev
```

This will launch the application on `http://localhost:3000`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```
This script generates the optimized static files in the `dist` folder, compiles the server, and automatically generates a fresh `sitemap.xml` file from your active database inventory.

To start the production server:
```bash
npm run start
```

## Website Guide

### For Customers
- **Browsing**: Navigate to the **Shop** section to view available AV products. Use the sidebar to filter by category or price, and the top dropdown to sort.
- **Quote Requests**: If you are a B2B client looking for bulk pricing or custom solutions, use the **Request Custom Quote** feature to get in touch with sales.
- **Support**: Check the FAQs, or initiate an RMA if you need to return a defective product.

### For Administrators
To access the admin panel, navigate to `/admin/login` and log in with your authorized admin credentials.

- **Dashboard (`/admin/overview`)**: View high-level metrics, recent orders, and stock alerts.
- **Products & Inventory (`/admin/products-all`, `/admin/products-inventory`)**: Add new products, update prices, and monitor stock thresholds.
- **Categories (`/admin/categories`)**: Create and organize product categories.
- **Orders (`/admin/orders-new`)**: Process incoming orders and update their fulfillment status.
- **Content Management (`/admin/homepage-editor`, etc.)**: Modify the text and imagery used on the public-facing pages (Homepage, About, Services, etc.) directly from the admin panel.

## Useful Scripts

- **`npm run seed`**: Populates the database with initial admin settings and test data. Run this if setting up a fresh Firestore instance.
- **`npm run lint`**: Checks the TypeScript codebase for any type or syntax errors.

## Deployment

The application is configured to run in containerized environments. The server automatically binds to port `3000`. Ensure that environment variables (if any) are properly set in your production hosting platform.
