# Story ID to Jira Key Mapping Guide

## Quick Start

**Need to find a story in Jira?**

Use this formula: **Local ID → Jira Key → Click link**

Example:
```
Local Story: US-101
→ Look up in mapping: FREIG-6
→ Open: https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-6
```

---

## Three Ways to Map Stories

### 1. **Markdown Table (Recommended for Quick Lookup)**
📄 **File:** `docs/project/Story_ID_to_Jira_Mapping.md`

**Features:**
- Clickable Jira links
- Human-readable format
- Sorted by story ID
- Includes full summary + current status

**How to use:**
1. Open the file in your editor or browser
2. Search for the story ID (e.g., `US-820`)
3. Click the Jira key link to jump to the issue

```
Example from markdown:
| US-820 | [FREIG-54](https://...) | KPI Summary Display | Done |
```

### 2. **CSV File (For Spreadsheet Import)**
📊 **File:** `docs/project/Story_ID_to_Jira_Mapping.csv`

**Features:**
- Machine-readable format
- Easy to import into Excel/Google Sheets
- Good for filtering, sorting, and analysis

**How to use:**
1. Download the CSV file
2. Open in Excel/Google Sheets: File → Open → Select CSV
3. Use filters to find stories by status or phase
4. Sort by story ID or Jira key

**Example columns:**
```
Local Story ID | Jira Key | Summary | Status
US-101        | FREIG-6  | Multi-Tenant Registration | Done
US-102        | FREIG-7  | Tenant Context & JWT | Done
```

### 3. **Jira Search (For Live Lookups)**
🔍 **Direct Jira search:**

- Search by **story ID**: Go to Jira board, search for `US-101` (matches labels)
- Search by **Jira key**: Search for `FREIG-6` (exact issue key)
- Filter by **status**: Click "Done" column to see all completed stories

---

## Common Tasks

### Task: "What's the Jira key for US-730?"

**Option A - Markdown:**
1. Open `docs/project/Story_ID_to_Jira_Mapping.md`
2. Ctrl+F search for `US-730`
3. Find: `US-730 → FREIG-62`
4. Click link to open in Jira

**Option B - CSV:**
1. Open `docs/project/Story_ID_to_Jira_Mapping.csv` in Excel
2. Filter for US-730
3. See Jira key: FREIG-62

**Option C - Jira:**
1. Go to Jira board: https://mdb-intergrated-logistics.atlassian.net/projects/FREIG
2. Search for `US-730` in search bar
3. Click result to open issue

---

### Task: "Find all DONE stories"

**Option A - Markdown:**
1. Open mapping file
2. Scroll through and look for `| Done` rows

**Option B - CSV:**
1. Open in Excel
2. Filter Status column = "Done"
3. See all 29 completed stories

**Option C - Jira:**
1. Go to board
2. Click "Done" column
3. See all Done issues

---

### Task: "What stories are IN PROGRESS?"

**Markdown:**
Search for `In Progress` in the file

**CSV:**
Filter Status = "In Progress" (should see US-705, US-706)

**Jira:**
Click "In Progress" column on board

---

### Task: "Map a batch of stories (for documentation)"

**CSV approach (best for bulk work):**
1. Open CSV in Excel
2. Copy relevant rows
3. Paste into your doc/spreadsheet
4. Format as needed

**Example:**
```
US-820 (FREIG-54) - KPI Summary Display - Done
US-821 (FREIG-55) - Shipper Header Navigation - Done
US-822 (FREIG-56) - Shipment Status Panel - Done
```

---

## The Mapping Files Explained

### Story_ID_to_Jira_Mapping.md
```markdown
| US-101 | [FREIG-6](link) | Multi-Tenant Registration | Done |
         ↑                ↑                              ↑
    Local ID         Jira Key                        Status
                  (clickable link)
```

### Story_ID_to_Jira_Mapping.csv
```csv
Local Story ID,Jira Key,Summary,Status
US-101,FREIG-6,Multi-Tenant Registration,Done
       ↑       ↑      ↑                  ↑
   Local ID  Jira   Summary           Status
             Key
```

---

## Story ID Formats

You'll see these prefixes in the mapping:

| Prefix | Meaning | Examples |
|--------|---------|----------|
| `US-###` | User stories (features) | US-101, US-730, US-820 |
| `US-###-v#` | Story variants | US-103-v2, US-707-v2 |
| `CHG-###` | Change requests | CHG-001, CHG-003 |
| `SEC-###` | Security work | SEC-001, SEC-002 |
| `INF-###` | Infrastructure | INF-001 |

---

## Updating the Mapping

New stories are automatically added to Jira during creation. To refresh the mapping files:

```bash
# Manual approach: Query Jira and regenerate
# Command available in JIRA_WORKFLOW.md
```

Or simply open the mapping file and manually add new entries with the pattern:
```
| NEW-ID | [FREIG-XYZ](https://...) | Story Title | To Do |
```

---

## Quick Reference: Top Stories by Status

### ✅ DONE (29 stories)
US-101, US-102, US-103, US-104, US-105, US-201-203, US-301-305, US-401-405, US-506, US-701-703, US-707, US-710, US-713, US-715, US-820-825

### 🔄 IN PROGRESS (2 stories)
US-705, US-706

### 📋 TO DO (Most new stories)
US-730 Epic + child stories (US-730-0 through US-730f)

---

## Need Help?

1. **Can't find a story?** → Try both markdown and CSV
2. **Need to filter/sort?** → Use CSV in spreadsheet
3. **Want clickable links?** → Use markdown
4. **Lost in Jira?** → Use story ID in Jira search bar
5. **Bulk work?** → Export CSV, work in spreadsheet, reimport

---

## Files Reference

| File | Purpose | Format | Best For |
|------|---------|--------|----------|
| `Story_ID_to_Jira_Mapping.md` | Quick lookup | Markdown table | Daily use, clicking links |
| `Story_ID_to_Jira_Mapping.csv` | Bulk operations | CSV | Filtering, sorting, analysis |
| `Story_Map.md` | Phase tracking | Markdown table | Understanding phases + roadmap |
| `JIRA_WORKFLOW.md` | Creation rules | Markdown | Creating new stories |

---

**Last Updated:** 2026-06-23  
**Total Stories Mapped:** 58  
**Mapping Location:** `docs/project/Story_ID_to_Jira_Mapping.*`
