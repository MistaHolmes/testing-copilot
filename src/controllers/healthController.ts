import { Request, Response } from 'express';

export const checkHealth = (req: Request, res: Response) => {
    // Log to console each time the health endpoint is hit
    console.log('Health endpoint hit');
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
};