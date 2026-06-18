/**
 * TypeScript type definitions for the Agile Dashboard
 * These types represent the structure of data parsed from Story_Map.md
 */
export type StoryStatus = 'COMPLETED' | 'IN_PROGRESS' | 'READY_FOR_DESIGN' | 'BACKLOG' | 'MIGRATION_PENDING';
export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 'cross';
export interface Story {
    id: string;
    title: string;
    status: StoryStatus;
    phase: PhaseNumber;
    dependencies: string[];
    roles: string[];
    coverage: number;
    completionDate?: string;
    notes?: string;
}
export interface CurrentSprint {
    number: number;
    stories: Story[];
    completedCount: number;
    totalCount: number;
}
export interface Dashboard {
    lastUpdated: string;
    activeStories: Story[];
    currentSprint: CurrentSprint;
    backlog: Story[];
}
export interface ValidationError {
    line: number;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
//# sourceMappingURL=types.d.ts.map