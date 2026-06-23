"use strict";
/**
 * CLI entry point for Story_Map.md validation
 * Used by git pre-commit hook to validate Story_Map.md before commits
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const parser_1 = require("./parser");
const filePath = path_1.default.join(process.cwd(), '/c/projects/freightclub/docs/project/Story_Map.md');
const result = (0, parser_1.validate)(filePath);
if (!result.valid) {
    console.error('❌ Story_Map.md validation failed');
    result.errors.forEach(error => {
        if (error.line > 0) {
            console.error(`  Line ${error.line}: ${error.message}`);
        }
        else {
            console.error(`  ${error.message}`);
        }
    });
    console.error('❌ Commit rejected. Fix errors and try again.');
    process.exit(1);
}
else {
    console.log('✅ Story_Map.md validation passed');
    process.exit(0);
}
//# sourceMappingURL=validate.js.map