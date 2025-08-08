import { defineConfig } from "tinacms"

// Your TinaCMS configuration
export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || // custom branch env var
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || // Vercel branch env var
    "main", // default branch
  clientId: process.env.TINA_CLIENT_ID, // Get this from tina.cloud
  token: process.env.TINA_TOKEN, // Get this from tina.cloud
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "home",
        label: "Home Page",
        path: "content",
        format: "json",
        fields: [
          {
            type: "string",
            name: "heroTitle",
            label: "Hero Title",
            required: true,
          },
          {
            type: "string",
            name: "heroSubtitle",
            label: "Hero Subtitle",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "string",
            name: "ctaText",
            label: "Call to Action Text",
            required: true,
          },
        ],
      },
    ],
  },
})
