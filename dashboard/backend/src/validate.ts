import { parseAndValidate } from './parser';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'docs/project/Story_Map.md');

const { stories, errors } = parseAndValidate(filePath);

console.log(`\n✅ Valid stories: ${stories.length}`);
if (stories.length > 0) {
  stories.forEach((s) => {
    console.log(`  - ${s.id}: ${s.title} [${s.status}] (Phase ${s.phase})`);
  });
}

if (errors.length > 0) {
  console.log(`\n❌ Validation errors: ${errors.length}`);
  errors.forEach((e) => {
    console.log(`  - ${e}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All stories validated successfully!');
  process.exit(0);
}
