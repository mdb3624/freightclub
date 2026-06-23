"use strict";
/**
 * Express server with file watcher for Agile Dashboard
 * Serves dashboard data via /api/dashboard endpoint
 * Watches Story_Map.md for changes and updates cache
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("./parser");
const app = (0, express_1.default)();
const PORT = 3001;
// Dashboard cache
let dashboardCache = null;
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
/**
 * Load dashboard from Story_Map.md
 */
function loadDashboard() {
    try {
        // Resolve path from project root (2 levels up from dashboard/backend)
        const projectRoot = path_1.default.join(__dirname, '../../..');
        const storyMapPath = path_1.default.join(projectRoot, 'docs/project/Story_Map.md');
        dashboardCache = (0, parser_1.parseMarkdown)(storyMapPath);
        const timestamp = new Date().toISOString();
        console.log(`✅ Dashboard loaded at ${timestamp}`);
    }
    catch (error) {
        console.error('❌ Failed to load dashboard:', error instanceof Error ? error.message : 'Unknown error');
        // Provide fallback data
        dashboardCache = {
            lastUpdated: new Date().toISOString(),
            activeStories: [],
            currentSprint: {
                number: 1,
                stories: [],
                completedCount: 0,
                totalCount: 0,
            },
            backlog: [],
        };
    }
}
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
/**
 * Dashboard API endpoint
 */
app.get('/api/dashboard', (req, res) => {
    if (!dashboardCache) {
        return res.status(500).json({
            error: 'Dashboard not loaded',
            timestamp: new Date().toISOString(),
        });
    }
    res.json(dashboardCache);
});
/**
 * Initialize file watcher for Story_Map.md
 */
function initializeFileWatcher() {
    const projectRoot = path_1.default.join(__dirname, '../../..');
    const storyMapPath = path_1.default.join(projectRoot, 'docs/project/Story_Map.md');
    const watcher = chokidar_1.default.watch(storyMapPath, {
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100,
        },
    });
    watcher.on('change', () => {
        console.log('📝 Story_Map.md changed, reloading...');
        loadDashboard();
    });
    watcher.on('error', (error) => {
        console.error('File watcher error:', error);
    });
}
/**
 * Start the server
 */
function startServer() {
    // Load dashboard on startup
    loadDashboard();
    // Initialize file watcher
    initializeFileWatcher();
    // Start Express server
    app.listen(PORT, () => {
        console.log(`🚀 Dashboard API server running on http://localhost:${PORT}`);
        console.log(`📊 Access dashboard at http://localhost:${PORT}`);
        console.log(`🔗 API endpoint: http://localhost:${PORT}/api/dashboard`);
    });
}
// Start the server
startServer();
//# sourceMappingURL=server.js.map