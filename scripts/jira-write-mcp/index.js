#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { basename } from "path";

const JIRA_INSTANCE_URL = process.env.JIRA_INSTANCE_URL;
const JIRA_API_KEY = process.env.JIRA_API_KEY;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;

if (!JIRA_INSTANCE_URL || !JIRA_API_KEY || !JIRA_USER_EMAIL) {
  console.error(
    "Error: JIRA_INSTANCE_URL, JIRA_USER_EMAIL, and JIRA_API_KEY must be set in the environment.",
  );
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_KEY}`).toString("base64")}`;

async function jiraFetch(path, options = {}) {
  const res = await fetch(`${JIRA_INSTANCE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jira API Error: ${res.status} ${res.statusText} ${text}`);
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

const server = new Server(
  { name: "jira-write-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "jira_list_transitions",
      description: "List available workflow transitions for a Jira issue.",
      inputSchema: {
        type: "object",
        properties: {
          issueIdOrKey: { type: "string", description: "ID or key of the issue" },
        },
        required: ["issueIdOrKey"],
      },
    },
    {
      name: "jira_transition_issue",
      description:
        "Transition a Jira issue to a new status. Provide either transitionId (exact) or transitionName (e.g. 'Done', 'In Progress', 'To Do') — name is resolved automatically via jira_list_transitions.",
      inputSchema: {
        type: "object",
        properties: {
          issueIdOrKey: { type: "string", description: "ID or key of the issue" },
          transitionId: { type: "string", description: "Exact transition id" },
          transitionName: { type: "string", description: "Transition name, case-insensitive" },
        },
        required: ["issueIdOrKey"],
      },
    },
    {
      name: "jira_add_comment",
      description: "Add a comment to a Jira issue.",
      inputSchema: {
        type: "object",
        properties: {
          issueIdOrKey: { type: "string", description: "ID or key of the issue" },
          body: { type: "string", description: "Comment text" },
        },
        required: ["issueIdOrKey", "body"],
      },
    },
    {
      name: "jira_add_attachment",
      description: "Attach a local file to a Jira issue.",
      inputSchema: {
        type: "object",
        properties: {
          issueIdOrKey: { type: "string", description: "ID or key of the issue" },
          filePath: { type: "string", description: "Absolute path to the local file to attach" },
          fileName: { type: "string", description: "Override attachment filename (defaults to basename of filePath)" },
        },
        required: ["issueIdOrKey", "filePath"],
      },
    },
    {
      name: "jira_create_issue",
      description: "Create a new Jira issue.",
      inputSchema: {
        type: "object",
        properties: {
          projectKey: { type: "string", description: "Project key, e.g. FREIG" },
          summary: { type: "string" },
          description: { type: "string" },
          issueType: { type: "string", description: "e.g. Story, Bug, Task", default: "Story" },
          labels: { type: "array", items: { type: "string" } },
        },
        required: ["projectKey", "summary"],
      },
    },
    {
      name: "jira_update_fields",
      description: "Update arbitrary fields on a Jira issue (e.g. summary, description, labels).",
      inputSchema: {
        type: "object",
        properties: {
          issueIdOrKey: { type: "string" },
          fields: { type: "object", description: "Fields object matching Jira's PUT /issue payload 'fields'" },
        },
        required: ["issueIdOrKey", "fields"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "jira_list_transitions": {
        const data = await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}/transitions`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "jira_transition_issue": {
        let transitionId = args.transitionId;
        if (!transitionId && args.transitionName) {
          const data = await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}/transitions`);
          const match = data.transitions.find(
            (t) => t.name.toLowerCase() === args.transitionName.toLowerCase(),
          );
          if (!match) {
            throw new Error(
              `No transition named "${args.transitionName}" available. Options: ${data.transitions.map((t) => t.name).join(", ")}`,
            );
          }
          transitionId = match.id;
        }
        if (!transitionId) throw new Error("Must provide transitionId or transitionName");
        await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}/transitions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transition: { id: transitionId } }),
        });
        return { content: [{ type: "text", text: `Transitioned ${args.issueIdOrKey} to transition ${transitionId}` }] };
      }
      case "jira_add_comment": {
        const data = await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: args.body }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "jira_add_attachment": {
        const fileData = readFileSync(args.filePath);
        const fileName = args.fileName || basename(args.filePath);
        const form = new FormData();
        form.append("file", new Blob([fileData]), fileName);
        const data = await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}/attachments`, {
          method: "POST",
          headers: { "X-Atlassian-Token": "no-check" },
          body: form,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "jira_create_issue": {
        const data = await jiraFetch(`/rest/api/2/issue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              project: { key: args.projectKey },
              summary: args.summary,
              description: args.description || "",
              issuetype: { name: args.issueType || "Story" },
              labels: args.labels || [],
            },
          }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "jira_update_fields": {
        await jiraFetch(`/rest/api/2/issue/${args.issueIdOrKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: args.fields }),
        });
        return { content: [{ type: "text", text: `Updated fields on ${args.issueIdOrKey}` }] };
      }
      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: `Error: ${error.message}` }] };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Error starting the server:", error);
  process.exit(1);
});
