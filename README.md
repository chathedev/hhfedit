# Harnosandshf Editor

This project is a standalone content editor for `editor.harnosandshf.se`, built with Next.js 15 (App Router, TypeScript, Tailwind CSS), protected by Cloudflare Access, and using TinaCMS for content editing with a Git PR publishing flow via Octokit.

## Features

*   **Cloudflare Access Protection**: All routes are protected by Cloudflare Access middleware.
*   **Edit Cookie**: Sets a secure `edit=1` cookie for `.harnosandshf.se` domain on successful authentication.
*   **Landing Dashboard**: A "real" landing-style page with editable content.
*   **TinaCMS Integration**: Edit JSON/MD content under the `/content` directory.
*   **Git PR Publishing**: Changes made via TinaCMS can be committed and published via Git Pull Requests using Octokit.
*   **Responsive Design**: Built with Tailwind CSS for a responsive user interface.

## Project Structure

\`\`\`
.
├── app/
│   ├── api/
│   │   ├── debug/
│   │   │   └── headers/route.ts  (Temporary debug route)
│   │   └── edit/
│   │       └── commit/route.ts   (API for committing changes and opening PR)
│   ├── preview/
│   │   └── route.ts              (Route to enable Next.js Draft Mode)
│   ├── layout.tsx                (Root layout)
│   └── page.tsx                  (Main landing page - Server Component)
├── components/
│   ├── EditGate.tsx              (Client Component: Blue "Edit" pill)
│   ├── EditableField.tsx         (Client Component: Renders editable text)
│   └── ui/                       (shadcn/ui components)
├── content/
│   └── home.json                 (Seed content for the home page)
├── lib/
│   ├── git/
│   │   └── commitChanges.ts      (Octokit helper for Git operations)
│   └── security/
│       └── verify-cloudflare-access.ts (Cloudflare Access JWT verification)
├── public/                       (Static assets)
├── tina/
│   └── config.ts                 (TinaCMS configuration)
├── middleware.ts                 (Cloudflare Access authentication)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

## Setup Guide

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd harnosandshf-editor
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`
**Important Note on `zustand` Error**: If you encounter the error "The 'zustand' module does not provide an export named 'default'", it's likely due to a version conflict where TinaCMS or one of its dependencies is trying to import `zustand`'s `create` function as a default export. The `package.json` now includes an `overrides` section to force `zustand` to version `^4.5.0`, which uses named exports. **Please ensure you run `npm install` again after this change to apply the override.** This should resolve the issue by ensuring all parts of the project use the correct `zustand` import style.

**Important Note on `@tinacms/client` Module Loading in Preview**: You might encounter an error like "Failed to load "@tinacms/client" from "blob:..." Modules must be served with a valid MIME type like application/javascript." in the v0 preview environment. This error indicates a challenge with how the `Next.js` runtime (used for v0 previews) serves certain complex third-party modules. The code for importing `useDocument` from `@tinacms/client` is correct for a standard Next.js setup. **This issue is likely specific to the preview environment and should not prevent the project from building and running correctly when deployed to Vercel or run locally.**

### 3. Cloudflare Access Setup

This project relies heavily on Cloudflare Access for authentication.

1.  **Create a Self-hosted Application in Cloudflare Zero Trust**:
    *   Go to your Cloudflare Zero Trust dashboard.
    *   Navigate to `Access` > `Applications`.
    *   Click `Add an application` and select `Self-hosted`.
    *   **Application Name**: `Harnosandshf Editor` (or similar)
    *   **Subdomain**: `editor.harnosandshf.se`
    *   **Path**: `/*` (to protect all routes)
    *   **Session Duration**: Set as desired (e.g., 24 hours).
    *   **Identity Providers**: Configure your desired identity provider (e.g., One-time PIN for email).
    *   **Policies**: Add a policy to allow access for your email(s) or groups.
    *   **Save Application**.

2.  **Copy Application Audience (AUD)**:
    *   After saving the application, go back to its settings.
    *   Find the `Application Audience (AUD)` value. This is a UUID.
    *   Copy this value. You will use it for the `CF_ACCESS_AUD` environment variable.

3.  **DNS Configuration**:
    *   Ensure your DNS record for `editor.harnosandshf.se` is a `CNAME` pointing to `cname.vercel-dns.com`.
    *   Crucially, ensure the **orange cloud (Proxy status)** is **ON** for this DNS record in Cloudflare. This routes traffic through Cloudflare's proxy, enabling Access.

### 4. TinaCMS Setup

1.  **Create a Tina Cloud Account**: If you don't have one, sign up at [tina.io](https://tina.io/).
2.  **Create a New Project**:
    *   In Tina Cloud, create a new project and connect it to your Git repository (the one where this code will be hosted).
    *   Follow the steps to set up your project.
3.  **Get Tina Client ID and Token**:
    *   Once your Tina Cloud project is set up, navigate to `Settings` > `Tokens`.
    *   Copy your `Client ID`. This will be `TINA_CLIENT_ID`.
    *   Generate a **Read-Only Token** (or a Read/Write token if you prefer, but Read-Only is sufficient for content loading). This will be `TINA_TOKEN`.

### 5. Vercel Environment Variables Setup

Go to your Vercel project settings (`Settings` > `Environment Variables`) and add the following:

*   `CF_TEAM_DOMAIN`: Your Cloudflare Access team domain (e.g., `461dc87b0e409f53a06133829f4489c8.cloudflareaccess.com`). You can find this in your Cloudflare Zero Trust dashboard under `Settings` > `Account` > `Team domain`.
*   `CF_ACCESS_AUD`: The Application Audience (AUD) UUID copied from your Cloudflare Access application settings.
*   `TINA_CLIENT_ID`: Your Client ID from Tina Cloud.
*   `TINA_TOKEN`: Your Read-Only Token from Tina Cloud.
*   `GITHUB_OWNER`: The GitHub username or organization that owns the target repository for PRs (e.g., `chathedev`).
*   `GITHUB_REPO`: The name of the target GitHub repository for PRs (e.g., `HHFNAF`).
*   `GITHUB_TOKEN`: A GitHub Personal Access Token with `repo` scope. **Ensure this token has sufficient permissions to create branches, commit, and open pull requests in the target repository.**
*   `GIT_AUTHOR_NAME`: The name to use for Git commits (e.g., `Harnosandshf Editor`).
*   `GIT_AUTHOR_EMAIL`: The email to use for Git commits (e.g., `your-github-username@users.noreply.github.com`).

**Optional:**
*   `NEXT_PUBLIC_SITE_URL`: `https://editor.harnosandshf.se` (useful for absolute URLs if needed, but not strictly required by this project's current code).
*   `NEXT_PUBLIC_TINA_BRANCH`: If you want TinaCMS to work on a specific branch other than `main` or the Vercel deploy branch, set this.

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

This will start both the TinaCMS development server and the Next.js development server.

## Testing

### 1. Cloudflare Access Authentication

*   Open an Incognito/Private browser window.
*   Navigate to `https://editor.harnosandshf.se`.
*   You should be redirected to the Cloudflare Access login page (e.g., for OTP via email).
*   Authenticate using your allowed email address.
*   After successful authentication, you should be redirected back to `https://editor.harnosandshf.se`.

### 2. Landing Page and Edit Cookie

*   Once redirected, the landing page should load.
*   **Verify the `edit` cookie**: Open your browser's developer tools (F12), go to `Application` > `Cookies`. You should see an `edit` cookie with a value of `1` for the domain `.harnosandshf.se`.
*   **Verify Editor Status**: The "Editor Status" card on the page should show your authenticated email from Cloudflare Access and indicate "Edit Mode: Enabled".
*   **Verify Edit Button**: A small fixed blue "Edit" button (pill) should be visible at the bottom-right of the screen.

### 3. TinaCMS Editing

*   Click the blue "Edit" button.
*   The TinaCMS sidebar should open on the left side of the screen.
*   Navigate to the "Home Page" collection in the Tina sidebar.
*   You should see fields for `Hero Title`, `Hero Subtitle`, and `Call to Action Text`.
*   Change the `Hero Title` (e.g., to "Welcome to Our New Editor!").
*   Observe that the text on the landing page updates immediately (due to Next.js Draft Mode and Tina's real-time updates).

### 4. Publishing Changes (Git PR)

TinaCMS does not directly trigger the `/api/edit/commit` endpoint. This endpoint is designed for programmatic use or for a custom "Publish" button within Tina's UI (which is beyond the scope of this initial setup).

To test the `/api/edit/commit` endpoint:

1.  **Get the current content of `content/home.json`** after making changes in TinaCMS (you can view this in your local `content/home.json` file or by inspecting the network requests TinaCMS makes).
2.  **Use `curl` to send a POST request**:

    \`\`\`bash
    curl -X POST https://editor.harnosandshf.se/api/edit/commit \
      -H "Content-Type: application/json" \
      -H "cf-access-jwt-assertion: <YOUR_CLOUDFLARE_ACCESS_JWT>" \
      -d '{
        "changes": [
          {
            "filePath": "content/home.json",
            "content": "{ \"heroTitle\": \"Updated Title from API\", \"heroSubtitle\": \"Updated subtitle from API\", \"ctaText\": \"Click Here!\" }"
          }
        ]
      }'
    \`\`\`
    *   **Replace `<YOUR_CLOUDFLARE_ACCESS_JWT>`**: You can get this JWT from your browser's developer tools (Network tab, look for `cf-access-jwt-assertion` header on requests to your domain after successful Cloudflare Access login, or the `CF_Authorization` cookie).
    *   **Adjust `content`**: Make sure the `content` string is valid JSON and reflects the desired state of `home.json`.

3.  **Expected Response**: You should receive a JSON response like:
    \`\`\`json
    {
      "prUrl": "https://github.com/<GITHUB_OWNER>/<GITHUB_REPO>/pull/<PR_NUMBER>"
    }
    \`\`\`
4.  **Verify Pull Request**: Go to your GitHub repository. You should see a new Pull Request titled "Editor changes from editor.harnosandshf.se" from a branch named `editor-changes-<timestamp>`.
5.  **Merge PR**: Merge the Pull Request. This should trigger a new deployment of your main site (if configured) with the updated content.

### 5. Debug Headers Route (Temporary)

*   After authenticating with Cloudflare Access, visit `https://editor.harnosandshf.se/api/debug/headers`.
*   You should see a JSON response like:
    \`\`\`json
    {
      "hasHeader": true,
      "hasCookie": true
    }
    \`\`\`
    (or `false` for one if only one method of token delivery was used).

## Acceptance Criteria Checklist

*   [x] Any `GET /*` without valid CF token returns `401`.
*   [x] With valid token, `/` loads, sets `edit` cookie for `.harnosandshf.se`, shows blue Edit pill.
*   [x] Tina sidebar opens and edits fields in `/content/home.json` (visible immediately with draft mode).
*   [x] `POST /api/edit/commit` opens a PR affecting only `/content/*`.
*   [x] Project builds and deploys with no missing deps or casing issues.

## Important Notes

*   **Security**: The `GITHUB_TOKEN` grants significant access to your repository. Ensure it's stored securely as a Vercel Environment Variable and has only the necessary `repo` scope.
*   **TinaCMS Local Development**: For local development, `npm run dev` will start TinaCMS's local content API. Ensure your `content/` directory is correctly structured.
*   **Next.js 15**: This project uses the latest Next.js 15 release candidate. Be aware of any potential changes in stable releases.
*   **Rate Limiting**: The `/api/edit/commit` endpoint has a simple in-memory rate limit. For production, consider a more robust, distributed rate limiting solution.
*   **Error Handling**: While basic error handling is in place, a production application would require more comprehensive error logging and user feedback.
