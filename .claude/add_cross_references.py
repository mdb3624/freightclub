#!/usr/bin/env python3
"""
Batch Cross-Reference Adder for FreightClub Documentation
Adds bidirectional cross-references to all markdown files
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

class CrossReferenceAdder:
    def __init__(self, base_path: str = ".", dry_run: bool = False):
        self.base_path = Path(base_path)
        self.dry_run = dry_run
        self.story_map_path = self.base_path / "docs" / "project" / "Story_Map.md"
        self.stories_dir = self.base_path / "docs" / "business" / "stories"
        self.updated_count = 0
        self.skipped_count = 0

    def get_story_files(self) -> List[Path]:
        """Get all US-*.md files from stories directory"""
        if not self.stories_dir.exists():
            print(f"❌ Stories directory not found: {self.stories_dir}")
            return []
        return sorted(self.stories_dir.glob("US-*.md"))

    def extract_story_id(self, filename: str) -> str:
        """Extract story ID from filename (US-123.md -> US-123)"""
        match = re.match(r"(US-\d+)", filename)
        return match.group(1) if match else filename.replace(".md", "")

    def extract_dependencies(self, content: str) -> Tuple[List[str], List[str]]:
        """Extract depends_on and enables from content"""
        depends = []
        enables = []

        # Look for "Depends On" or "Blocks" patterns
        depends_match = re.search(r"Depends\s*On[:\s]*([^\n]+)", content, re.IGNORECASE)
        if depends_match:
            deps_str = depends_match.group(1)
            depends = [s.strip() for s in re.findall(r"US-\d+", deps_str)]

        blocks_match = re.search(r"Blocks[:\s]*([^\n]+)", content, re.IGNORECASE)
        if blocks_match:
            blocks_str = blocks_match.group(1)
            enables = [s.strip() for s in re.findall(r"US-\d+", blocks_str)]

        return depends, enables

    def add_header_to_story(self, filepath: Path, story_id: str, depends: List[str], enables: List[str]) -> str:
        """Add cross-reference header to story file"""
        content = filepath.read_text(encoding="utf-8")

        # Skip if already has cross-references
        if "📍 Related Documents" in content:
            return content

        # Build header content
        header = f"\n**📍 Related Documents**\n"
        header += "- [[Story_Map.md|← Story Map (Master Index)]] — Find all stories here\n"
        header += "- [[VAULT_INDEX.md]] — Complete documentation index\n"
        header += "- [[docs/roles/BUSINESS_ANALYST.md]] — Story writing guide\n"

        if depends:
            deps_links = ", ".join([f"[[{d}.md|{d}]]" for d in depends])
            header += f"- **Depends On:** {deps_links}\n"

        if enables:
            enables_links = ", ".join([f"[[{e}.md|{e}]]" for e in enables])
            header += f"- **Enables:** {enables_links}\n"

        header += "\n---\n"

        # Insert after first separator
        new_content = re.sub(
            r"(^#.*?\n\n.*?---\n)",
            rf"\1{header}",
            content,
            count=1,
            flags=re.MULTILINE | re.DOTALL
        )

        return new_content

    def add_footer_to_story(self, content: str, story_id: str) -> str:
        """Add navigation footer to story file"""
        if "## Navigation" in content:
            return content

        footer = f"\n---\n\n## Navigation\n\n"
        footer += "[[Story_Map.md|← Back to Story Map]] | [[VAULT_INDEX.md|Documentation Index]]\n\n"
        footer += f"**Story File:** `docs/business/stories/{story_id}.md`\n"

        return content + footer

    def process_story_file(self, filepath: Path) -> bool:
        """Process a single story file and add cross-references"""
        story_id = self.extract_story_id(filepath.name)

        try:
            content = filepath.read_text(encoding="utf-8")
            depends, enables = self.extract_dependencies(content)

            # Add header
            content = self.add_header_to_story(filepath, story_id, depends, enables)

            # Add footer
            content = self.add_footer_to_story(content, story_id)

            if not self.dry_run:
                filepath.write_text(content, encoding="utf-8")
                print(f"✅ Updated: {story_id}")
            else:
                print(f"🔍 [DRY RUN] Would update: {story_id}")

            self.updated_count += 1
            return True

        except Exception as e:
            print(f"❌ Error processing {story_id}: {e}")
            return False

    def run(self):
        """Run batch processing on all story files"""
        print("🔄 Batch Cross-Reference Processor\n")

        files = self.get_story_files()
        if not files:
            print("❌ No story files found!")
            return

        print(f"📊 Found {len(files)} story files to process\n")

        if self.dry_run:
            print("⚠️  DRY RUN MODE - No changes will be made\n")

        for filepath in files:
            self.process_story_file(filepath)

        print(f"\n✅ Batch processing complete!")
        print(f"Updated: {self.updated_count} files")

        if self.dry_run:
            print("\n💡 To apply changes, remove the dry_run flag or set it to False")


def main():
    import sys

    # Check if running with dry-run flag
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    adder = CrossReferenceAdder(base_path=".", dry_run=dry_run)
    adder.run()


if __name__ == "__main__":
    main()
