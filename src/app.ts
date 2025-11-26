import express from 'express';
import healthRouter from './routes/health';
import formRouter from './routes/form';
import { getLocation } from './controllers/formController';
import { errorHandler } from './middlewares/errorHandler';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());

// Rate limiter for write endpoints (e.g., form submissions)
const formLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // limit each IP to 10 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
});

// Routes
app.use('/health', healthRouter);
app.use('/forms', formRouter);

// Also expose a root-level route for locations: GET /getLocation
app.get('/getLocation', getLocation);

// Error handler (last)
app.use(errorHandler);

export default app;