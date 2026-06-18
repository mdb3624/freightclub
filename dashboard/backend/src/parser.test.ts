import { parseAndValidate, validate } from './parser';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { resolve } from 'path';

describe('Parser - Markdown Formatting Support', () => {
  let testFilePath: string;

  beforeEach(() => {
    // Create temp test file directory
    const testDir = resolve(__dirname, '../test-fixtures');
    mkdirSync(testDir, { recursive: true });
    testFilePath = resolve(testDir, 'test-story-map.md');
  });

  afterEach(() => {
    try {
      unlinkSync(testFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('cleanMarkdownValue helper', () => {
    it('should remove bold markdown formatting', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| **US-101** | **Bold Title** | **COMPLETED** | **1** |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(errors).toHaveLength(0);
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe('US-101');
      expect(stories[0].title).toBe('Bold Title');
      expect(stories[0].status).toBe('COMPLETED');
      expect(stories[0].phase).toBe('1');
    });

    it('should remove emoji characters', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ US-102 | Dashboard 📊 | ✅ COMPLETED | 🚀 2 |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(errors).toHaveLength(0);
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe('US-102');
      expect(stories[0].title).toBe('Dashboard');
      expect(stories[0].status).toBe('COMPLETED');
      expect(stories[0].phase).toBe('2');
    });

    it('should handle combined bold and emoji', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ **US-103** | **Load Creation** 📊 | **IN_PROGRESS** | **3** |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(errors).toHaveLength(0);
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe('US-103');
      expect(stories[0].title).toBe('Load Creation');
      expect(stories[0].status).toBe('IN_PROGRESS');
      expect(stories[0].phase).toBe('3');
    });

    it('should trim whitespace and dashes', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| - **US-104** - | - **Payments** - | - **PAUSED** - | - **4** - |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(errors).toHaveLength(0);
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe('US-104');
      expect(stories[0].title).toBe('Payments');
      expect(stories[0].status).toBe('PAUSED');
      expect(stories[0].phase).toBe('4');
    });
  });

  describe('validate function', () => {
    it('should accept clean values without errors', () => {
      const story = {
        id: 'US-201',
        title: 'Test Story',
        status: 'COMPLETED',
        phase: '5',
        raw: [],
      };

      const error = validate(story);
      expect(error).toBeNull();
    });

    it('should clean and validate formatted values', () => {
      const story = {
        id: '**US-202**',
        title: '**Test Story**',
        status: '✅ **COMPLETED**',
        phase: '**6** 🚀',
        raw: [],
      };

      const error = validate(story);
      expect(error).toBeNull();
    });

    it('should reject invalid status after cleaning', () => {
      const story = {
        id: 'US-203',
        title: 'Test Story',
        status: 'INVALID_STATUS',
        phase: '7',
        raw: [],
      };

      const error = validate(story);
      expect(error).toContain('Invalid status');
    });

    it('should reject invalid phase after cleaning', () => {
      const story = {
        id: 'US-204',
        title: 'Test Story',
        status: 'COMPLETED',
        phase: '99',
        raw: [],
      };

      const error = validate(story);
      expect(error).toContain('Invalid phase');
    });
  });

  describe('parseAndValidate integration', () => {
    it('should parse multiple formatted stories', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ **US-301** | **Load Board** | **COMPLETED** | **1** |
| 🔄 **US-302** | **Driver Profile** 📊 | **IN_PROGRESS** | **2** |
| ⚠️ **US-303** | **Payments System** | **PAUSED** | **3** |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(errors).toHaveLength(0);
      expect(stories).toHaveLength(3);

      expect(stories[0].id).toBe('US-301');
      expect(stories[1].id).toBe('US-302');
      expect(stories[2].id).toBe('US-303');
    });

    it('should report validation errors while accepting formatted text', () => {
      const content = `# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ **US-401** | **Load Board** | **COMPLETED** | **1** |
| ❌ **US-402** | **Bad Story** | **INVALID** | **2** |
`;
      writeFileSync(testFilePath, content);
      const { stories, errors } = parseAndValidate(testFilePath);

      expect(stories).toHaveLength(1);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Invalid status');
    });
  });
});
