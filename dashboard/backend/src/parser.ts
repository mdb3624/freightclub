/**
 * Markdown parser for extracting story data from Story_Map.md
 */

import fs from 'fs';
import path from 'path';
import { Dashboard, Story, StoryStatus, PhaseNumber, ValidationResult, ValidationError } from './types';

const VALID_STATUSES: StoryStatus[] = ['COMPLETED', 'IN_PROGRESS', 'READY_FOR_DESIGN', 'BACKLOG', 'MIGRATION_PENDING', 'PARTIAL', 'READY_FOR_REVIEWER_RE_AUDIT'];
const VALID_PHASES: PhaseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 'cross'];

/**
 * Find the column index of a header by name (case-insensitive, strips bold markers)
 */
function findColumnIndex(headerCells: string[], name: string): number {
  return headerCells.findIndex(
    cell => cell.replace(/\*\*/g, '').trim().toUpperCase() === name.toUpperCase()
  );
}

/**
 * Normalize status from Obsidian markdown format
 * Strips emojis, bold markers, and maps common variations
 */
function normalizeStatus(raw: string): string {
  // Remove markdown formatting and emojis
  let normalized = raw
    .replace(/\*\*/g, '')                    // Remove bold markers **text**
    .replace(/[✅❌⚠️📊📅📋🔄⏳]/g, '')   // Remove emojis
    .replace(/^[→|]\s*/g, '')               // Remove arrow prefixes
    .split(/[|→]/)[0]                       // Take first part if split by delimiter
    .trim();

  // Remove leading/trailing dashes or special chars
  normalized = normalized.replace(/^[-\s]+|[-\s]+$/g, '').trim();

  // Map common variations to standard statuses
  const statusMap: Record<string, StoryStatus> = {
    'DONE': 'COMPLETED',
    'IN PROGRESS': 'IN_PROGRESS',
    'READY FOR DESIGN': 'READY_FOR_DESIGN',
    'IN_PROGRESS': 'IN_PROGRESS',
    'READY_FOR_DESIGN': 'READY_FOR_DESIGN',
    'PARTIAL': 'PARTIAL',
    'READY FOR REVIEWER RE-AUDIT': 'READY_FOR_REVIEWER_RE_AUDIT',
    'READY_FOR_REVIEWER_RE_AUDIT': 'READY_FOR_REVIEWER_RE_AUDIT',
  };

  const upperNorm = normalized.toUpperCase();
  return statusMap[upperNorm] || (VALID_STATUSES.includes(upperNorm as StoryStatus) ? upperNorm : '');
}

/**
 * Normalize phase from Obsidian markdown format
 * Handles numeric phases and 'cross' phase, case-insensitive
 */
function normalizePhase(raw: string): string {
  let normalized = raw
    .replace(/\*\*/g, '')   // Strip bold markers
    .trim()
    .toLowerCase();

  // Handle "Cross" → "cross"
  if (normalized === 'cross') return 'cross';

  // Try to parse as number
  const num = parseInt(normalized, 10);
  if (!isNaN(num)) return num.toString();

  return raw;
}

/**
 * Parse a markdown file and extract story data
 */
export function parseMarkdown(filepath: string): Dashboard {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');

  const stories = parseTableRows(lines);
  console.log(`✅ Parsed ${stories.length} valid stories from Story_Map.md`);

  const activeStories = stories.filter(
    s => s.status === 'IN_PROGRESS' || s.status === 'READY_FOR_DESIGN'
  );
  console.log(`  - Active stories: ${activeStories.length}`);

  const currentSprint: Dashboard['currentSprint'] = {
    number: 1,
    stories: stories.filter(s => [1, 2, 3].includes(s.phase as number) && s.status !== 'BACKLOG'),
    completedCount: stories.filter(s => s.status === 'COMPLETED').length,
    totalCount: stories.length,
  };

  const backlog = stories.filter(s => s.status === 'BACKLOG' || s.phase === 'cross' || ![1, 2, 3].includes(s.phase as number));

  return {
    lastUpdated: new Date().toISOString(),
    activeStories,
    currentSprint,
    backlog,
  };
}

/**
 * Parse table rows from markdown content
 */
function parseTableRows(lines: string[]): Story[] {
  const stories: Story[] = [];
  let headerFound = false;
  let pendingHeaderCells: string[] | null = null;
  let phaseColumnIndex = 3;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip the markdown separator line (contains ---)
    if (line.includes('---')) {
      if (line.includes('|')) {
        headerFound = true;
        phaseColumnIndex = pendingHeaderCells ? findColumnIndex(pendingHeaderCells, 'Phase') : -1;
      }
      continue;
    }

    // A non-separator row encountered while not in a table is a header label row
    if (!headerFound && line.startsWith('|')) {
      pendingHeaderCells = parseTableRow(line);
    }

    // Process table rows (must start with | and have cells)
    if (headerFound && line.startsWith('|') && !line.includes('---')) {
      const cells = parseTableRow(line);
      if (cells.length >= 5) {
        const story = createStoryFromRow(cells, phaseColumnIndex);
        if (story) {
          stories.push(story);
        }
      }
    }

    // Stop when we exit the table (empty line after data rows)
    if (headerFound && !line.startsWith('|') && line.length > 0) {
      headerFound = false;
      pendingHeaderCells = null;
    }
  }

  return stories;
}

/**
 * Parse a single table row
 */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);
}

/**
 * Create a Story object from a table row
 */
function createStoryFromRow(cells: string[], phaseColumnIndex: number = 3): Story | null {
  if (cells.length < 5) {
    return null;
  }

  // Tables without a Phase column (e.g. Backlog: ID | Title | Status | Depends On | Rationale)
  // shift "Depends On" into the slot the default schema expects Phase to occupy.
  const hasPhaseColumn = phaseColumnIndex >= 0;
  const dependsOnIndex = hasPhaseColumn ? phaseColumnIndex + 1 : phaseColumnIndex;

  const id = cells[0].trim();
  const title = cells[1].trim();
  const rawStatus = cells[2];
  const rawPhase = hasPhaseColumn ? cells[phaseColumnIndex] : null;
  const dependsOn = cells[dependsOnIndex] ?? '';

  // Skip empty rows
  if (!id || !title) {
    return null;
  }

  // Skip repeated sub-table header rows (e.g. "| Story ID | Title | Status | Phase | Depends On |")
  const normalizedId = id.replace(/\*\*/g, '').trim().toUpperCase();
  if (normalizedId === 'ID' || normalizedId === 'STORY ID') {
    return null;
  }

  // Normalize and validate status
  const normalizedStatus = normalizeStatus(rawStatus);
  if (!normalizedStatus || !VALID_STATUSES.includes(normalizedStatus as StoryStatus)) {
    console.warn(`Invalid status "${rawStatus}" → "${normalizedStatus}" for story ${id}`);
    return null;
  }
  const status = normalizedStatus as StoryStatus;

  // Normalize and validate phase (tables without a Phase column default to 'cross' — deferred/backlog items)
  let parsedPhase: PhaseNumber;

  if (rawPhase === null) {
    parsedPhase = 'cross';
  } else {
    const normalizedPhase = normalizePhase(rawPhase);
    if (normalizedPhase === 'cross') {
      parsedPhase = 'cross';
    } else {
      const phaseNum = parseInt(normalizedPhase, 10);
      if (!VALID_PHASES.includes(phaseNum as PhaseNumber)) {
        console.warn(`Invalid phase "${rawPhase}" → "${normalizedPhase}" for story ${id}`);
        return null;
      }
      parsedPhase = phaseNum as PhaseNumber;
    }
  }

  // Parse dependencies
  const dependencies = dependsOn
    .split(',')
    .map(dep => dep.trim())
    .filter(dep => dep.length > 0);

  return {
    id,
    title,
    status,
    phase: parsedPhase,
    dependencies,
    roles: [],
    coverage: 0,
  };
}

/**
 * Validate a markdown file for correctness
 */
export function validate(filepath: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    if (!fs.existsSync(filepath)) {
      return {
        valid: false,
        errors: [{ line: 0, message: `File not found: ${filepath}` }],
      };
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    const stories = parseTableRows(lines);

    const seenIds = new Set<string>();
    let headerFound = false;
    let lineNumber = 0;
    let pendingHeaderCells: string[] | null = null;
    let phaseColumnIndex = 3;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track header line
      if (line.includes('---') && line.includes('|')) {
        headerFound = true;
        phaseColumnIndex = pendingHeaderCells ? findColumnIndex(pendingHeaderCells, 'Phase') : -1;
        continue;
      }

      // Skip separator lines
      if (line.includes('---')) {
        continue;
      }

      // A non-separator row encountered while not in a table is a header label row
      if (!headerFound && line.startsWith('|')) {
        pendingHeaderCells = parseTableRow(line);
        continue;
      }

      // Reset state once we exit a table (blank/text line after data rows)
      if (headerFound && !line.startsWith('|') && line.length > 0) {
        headerFound = false;
        pendingHeaderCells = null;
      }

      // Only process lines that are table rows (start with |)
      if (!headerFound || !line.startsWith('|')) {
        continue;
      }

      lineNumber = i + 1;
      const cells = parseTableRow(line);
      if (cells.length < 5) {
        continue;
      }

      const hasPhaseColumn = phaseColumnIndex >= 0;
      const id = cells[0];
      const rawStatus = cells[2];
      const rawPhase = hasPhaseColumn ? cells[phaseColumnIndex] : null;

      // Skip repeated sub-table header rows (e.g. "| Story ID | Title | Status | Phase | Depends On |")
      const normalizedId = id.replace(/\*\*/g, '').trim().toUpperCase();
      if (normalizedId === 'ID' || normalizedId === 'STORY ID') {
        continue;
      }

      // Check for duplicate IDs
      if (seenIds.has(id)) {
        errors.push({
          line: lineNumber,
          message: `Duplicate story ID: ${id}`,
        });
      }
      seenIds.add(id);

      // Validate status (normalized for Obsidian formatting: bold, emojis)
      const status = normalizeStatus(rawStatus);
      if (!status || !VALID_STATUSES.includes(status as StoryStatus)) {
        errors.push({
          line: lineNumber,
          message: `Invalid status "${rawStatus}" for story ${id}. Valid: ${VALID_STATUSES.join(', ')}`,
        });
      }

      // Validate phase (normalized for Obsidian formatting: bold); tables without a
      // Phase column (e.g. Backlog) have nothing to validate here.
      const phase = rawPhase === null ? 'cross' : normalizePhase(rawPhase);
      if (phase !== 'cross') {
        const phaseNum = parseInt(phase, 10);
        if (isNaN(phaseNum) || !VALID_PHASES.includes(phaseNum as PhaseNumber)) {
          errors.push({
            line: lineNumber,
            message: `Invalid phase "${rawPhase}" for story ${id}. Valid: ${VALID_PHASES.join(', ')}`,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          line: 0,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}
