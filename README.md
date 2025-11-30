<div align="center"><h1>Ahsan Enterprise Webapp</h1></div>
<div align="center">Built with the Next.js</div>
<br />
<div align="center">
<a href="https://ahsanenterprise-webapp.vercel.app/">Live</a>
<span> · </span>
<a href="https://github.com/fnabir/AEAdminWebApp">Repository</a>
<span>
</div>

## Overview

This is the WebApp version of ALBAdmin Android App. It is built using the following stack:

- Framework - [Next.js v16 (App Router)](https://nextjs.org)
- Language - [TypeScript](https://www.typescriptlang.org)
- Auth - [Firebase Authentication](https://firebase.google.com/docs/auth)
- Database - [Firebase Realtime Database](https://firebase.google.com/docs/database)
- Deployment - [Vercel](https://vercel.com/docs/concepts/next.js/overview)
- Styling - [Tailwind CSS v4](https://tailwindcss.com)
- Components - [Shadcn UI](https://ui.shadcn.com/)

This project uses the Next.js App Router. This includes support for enhanced layouts, colocation of components, styles, component-level data fetching, and more.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Deploy on Server

This project is deployed on Vercel.

Production branch is the branch which gest build on new push and deployed automatically. Live version can be seen through [https://ahsanenterprise-webapp.vercel.app/](https://ahsanenterprise-webapp.vercel.app/)

## Changelog

### 1.2.0 [2025-11-30]

- [FEATURE] Swap file no option.
- [FEATURE] Delete file option.
- [UPDATE] File can be added back up to 2021.
- [UPDATE] Duty and Port input field will take up to 10 entires.
- [FIX] New file without status won't show until all the filters are disabled.

### 1.1.0 [2025-10-29]

- [FEATURE] Note option for files.

### 1.0.0 [2025-10-26]

- [FEATURE] Staff access.
- [UPDATE] Staff can only add expense record but only admin can delete.

### 0.4.0 [2025-06-20]

- [FEATURE] Option to show files depending on file status.
- [FEATURE] File details page include staff expense.
- [UPDATE] Staff expense now requires file no.

### 0.3.1 [2025-05-22]

- [UPDATE] Loading window now shows up as soon as the page found and fades out at the end.
- [FIX] Changing year to see the files would create another entry to url history. Thus clicking back would take through the change of years in the same page.

### 0.3.0 [2025-05-18]

- [FEATURE] Option to add expense and payment transaction for staffs.
- [FEATURE] Option to add payment transaction for importers.
- [FEATURE] Option to add bills for importers from files.
- [FIX] Unnecessary page re-rendering.

### 0.2.0 [2025-05-14]

- [FEATURE] Toggle button to see print layout of a file.
- [UPDATE] Default layout introduced different than print layout.

### 0.1.0 [2025-05-11]

- [FEATURE] Suggestion for new file no in add new dialog.
- [FEATURE] Password field in login and change password now have option to show/hide.
- [UPDATE] Theme and Show Balance persists after refresh.
- [FIX] Total value was wrong not calculating duty value.
- [FIX] Pressing check new file button in add new file dialog would show error for required field before pressing submit button.
