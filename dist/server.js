"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const shutdown_1 = __importDefault(require("./utils/shutdown"));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = http_1.default.createServer(app_1.default);
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
// Provide a simple cleanup function for gracefulShutdown (placeholder for db disconnects)
const cleanup = async () => {
    // put async cleanup here (close DB pools, flush queues, etc.)
    return Promise.resolve();
};
// Wire graceful shutdown
(0, shutdown_1.default)(server, cleanup);
exports.default = server;
