# Jira MCP Server Setup

**Status:** ✅ Configured  
**Date:** 2026-06-23  
**Configuration File:** `.claude/mcp.json`

---

## How It Works

The Jira MCP server is configured to read credentials from your `.env` file:

```
JIRA_DOMAIN=mdb-integrated-logistics.atlassian.net
JIRA_EMAIL=<your-email>
JIRA_API_TOKEN=<your-new-api-token>
```

The `.claude/mcp.json` file references these variables — your credentials stay private in `.env` (which is git-ignored).

---

## Using Jira MCP in Claude Code

Once the MCP server loads, you can use Jira commands like:

**Search for issues:**
```
Find all open issues in the FREIG project assigned to me
```

**Create issues:**
```
Create a new Jira issue in FREIG project with title "..." and description "..."
```

**Update issues:**
```
Update issue FREIG-123 to status "In Progress"
```

**List projects:**
```
List all Jira projects I have access to
```

---

## Troubleshooting

**If MCP doesn't load:**

1. Verify `.env` has all three JIRA_ variables
2. Restart Claude Code (exit and reopen)
3. Check that API token hasn't expired (regenerate if needed)
4. Confirm `.env` is in `.gitignore`

**If connection fails:**

- Test token manually: `curl -u JIRA_EMAIL:JIRA_API_TOKEN https://JIRA_DOMAIN/rest/api/3/myself`
- Verify domain format: `mdb-integrated-logistics.atlassian.net` (no `https://`)

---

## Security Notes

✅ Credentials stored in `.env` (git-ignored)  
✅ API token never shared or committed  
✅ MCP reads from environment variables  
✅ If token compromised, regenerate new one in Jira settings

---

**Ready to use!** Start a new Claude Code session and try a Jira query.
