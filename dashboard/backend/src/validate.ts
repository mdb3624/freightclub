/**
 * CLI entry point for Story_Map.md validation
 * Used by git pre-commit hook to validate Story_Map.md before commits
 */

import path from 'path';
import { validate } from './parser';

const filePath = path.join(process.cwd(), '/c/projects/freightclub/docs/project/Story_Map.md');

const result = validate(filePath);

if (!result.valid) {
  console.error('❌ Story_Map.md validation failed');
  result.errors.forEach(error => {
    if (error.line > 0) {
      console.error(`  Line ${error.line}: ${error.message}`);
    } else {
      console.error(`  ${error.message}`);
    }
  });
  console.error('❌ Commit rejected. Fix errors and try again.');
  process.exit(1);
} else {
  console.log('✅ Story_Map.md validation passed');
  process.exit(0);
}
