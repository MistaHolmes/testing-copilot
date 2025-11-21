"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = void 0;
const checkHealth = (req, res) => {
    // Log to console each time the health endpoint is hit
    console.log('Health endpoint hit');
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
};
exports.checkHealth = checkHealth;
