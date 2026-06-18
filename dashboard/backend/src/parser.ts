import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Valid story statuses
const VALID_STATUSES = [
  'READY_FOR_DESIGN',
  'READY_FOR_IMPLEMENTATION',
  'IN_PROGRESS',
  'COMPLETED',
  'PAUSED',
  'BLOCKED',
  'BACKLOG',
];

// Valid phases
const VALID_PHASES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'B', 'C'];

/**
 * Cleans markdown-formatted values by removing bold markers and emoji
 * @param value Raw value potentially containing markdown/emoji
 * @returns Cleaned string suitable for validation
 */
function cleanMarkdownValue(value: string): string {
  if (!value) return '';

  // Remove bold markdown (**text** -> text)
  let cleaned = value.replace(/\*\*(.+?)\*\*/g, '$1');

  // Remove specific emoji and special markers
  cleaned = cleaned
    .replace(/✅/g, '')
    .replace(/❌/g, '')
    .replace(/⚠️/g, '')
    .replace(/🔗/g, '')
    .replace(/📊/g, '')
    .replace(/🚀/g, '')
    .replace(/🔄/g, '') // Add rotating arrows emoji
    .replace(/\[DEBT:AUTO\]/g, '') // Also remove debt markers
    .trim();

  // Remove any remaining emoji (Unicode ranges for emoji)
  // This catches most emoji characters
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');

  // Remove leading/trailing dashes and spaces
  cleaned = cleaned.replace(/^[\s\-]+|[\s\-]+$/g, '').trim();

  return cleaned;
}

interface StoryRow {
  id: string;
  title: string;
  status: string;
  phase: string;
  raw: string[];
}

/**
 * Parses a single story row from the CSV
 * @param row Raw CSV row
 * @param headers Column headers
 * @returns Parsed story object with cleaned values
 */
function parseStoryRow(row: string[], headers: string[]): StoryRow | null {
  const idIdx = headers.indexOf('Story');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.indexOf('Status');
  const phaseIdx = headers.indexOf('Phase');

  if (idIdx === -1 || titleIdx === -1 || statusIdx === -1 || phaseIdx === -1) {
    return null;
  }

  const rawId = row[idIdx] || '';
  const rawTitle = row[titleIdx] || '';
  const rawStatus = row[statusIdx] || '';
  const rawPhase = row[phaseIdx] || '';

  // Clean markdown from extracted values
  const id = cleanMarkdownValue(rawId);
  const title = cleanMarkdownValue(rawTitle);
  const status = cleanMarkdownValue(rawStatus);
  const phase = cleanMarkdownValue(rawPhase);

  return {
    id,
    title,
    status,
    phase,
    raw: row,
  };
}

/**
 * Validates a single story
 * @param story Parsed story object
 * @returns Error message if invalid, null if valid
 */
function validateStory(story: StoryRow): string | null {
  if (!story.id) {
    return `Row missing Story ID`;
  }

  if (!story.title) {
    return `${story.id}: Missing title`;
  }

  if (!VALID_STATUSES.includes(story.status)) {
    return `${story.id}: Invalid status "${story.status}". Must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  if (!VALID_PHASES.includes(story.phase)) {
    return `${story.id}: Invalid phase "${story.phase}". Must be one of: ${VALID_PHASES.join(', ')}`;
  }

  return null;
}

/**
 * Parses and validates a markdown file (CSV format) containing story entries
 * @param filePath Path to the markdown file
 * @returns Array of parsed stories and validation errors
 */
export function parseAndValidate(
  filePath: string
): { stories: StoryRow[]; errors: string[] } {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Extract markdown table rows
    const lines = content.split('\n');
    const tableRows: string[] = [];
    let inTable = false;
    let headers: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Check if line is a markdown table row (starts and ends with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (inTable === false) {
          inTable = true;
        }

        // Skip separator rows (contain only dashes and pipes)
        if (trimmed.match(/^\|[\s\-|]+\|$/)) {
          continue;
        }

        tableRows.push(trimmed);
      } else if (inTable) {
        // End of table
        break;
      }
    }

    if (tableRows.length === 0) {
      return { stories: [], errors: ['No table found in markdown file'] };
    }

    // Parse header row
    const headerRow = tableRows[0];
    headers = headerRow
      .split('|')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    if (headers.length === 0) {
      return { stories: [], errors: ['Invalid table format: no headers'] };
    }

    const stories: StoryRow[] = [];
    const errors: string[] = [];

    // Parse data rows (skip header, which is first row)
    for (let i = 1; i < tableRows.length; i++) {
      const row = tableRows[i]
        .split('|')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      // Skip empty rows
      if (row.length === 0) {
        continue;
      }

      const story = parseStoryRow(row, headers);
      if (!story) {
        errors.push(`Row ${i + 1}: Could not parse (missing required columns)`);
        continue;
      }

      const validationError = validateStory(story);
      if (validationError) {
        errors.push(`Row ${i + 1}: ${validationError}`);
      } else {
        stories.push(story);
      }
    }

    return { stories, errors };
  } catch (error) {
    return {
      stories: [],
      errors: [`Failed to read file: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

/**
 * Validates a parsed story object
 * @param story Story object to validate
 * @returns Error message if invalid, null if valid
 */
export function validate(story: StoryRow): string | null {
  // Apply cleanMarkdownValue to all fields for safety
  const cleanStory: StoryRow = {
    ...story,
    id: cleanMarkdownValue(story.id),
    title: cleanMarkdownValue(story.title),
    status: cleanMarkdownValue(story.status),
    phase: cleanMarkdownValue(story.phase),
  };

  return validateStory(cleanStory);
}
