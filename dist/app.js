"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_1 = __importDefault(require("./routes/health"));
const form_1 = __importDefault(require("./routes/form"));
const formController_1 = require("./controllers/formController");
const errorHandler_1 = require("./middlewares/errorHandler");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Enable CORS
app.use((0, cors_1.default)());
// Middleware
app.use(express_1.default.json());
// Rate limiter for write endpoints (e.g., form submissions)
const formLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});
// Routes
app.use('/health', health_1.default);
app.use('/forms', form_1.default);
// Also expose a root-level route for locations: GET /getLocation
app.get('/getLocation', formController_1.getLocation);
// Error handler (last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
