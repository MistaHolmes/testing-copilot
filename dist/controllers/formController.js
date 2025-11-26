"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = exports.getForms = exports.createForm = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createForm = async (req, res) => {
    try {
        const { name, email, message, latitude, longitude } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'name, email and message are required' });
        }
        const data = { name, email, message };
        if (typeof latitude === 'number')
            data.latitude = latitude;
        if (typeof longitude === 'number')
            data.longitude = longitude;
        const created = await prisma_1.default.form.create({
            data,
        });
        console.log('Form submitted:', created.id);
        return res.status(201).json(created);
    }
    catch (err) {
        console.error('Error creating form', err);
        return res.status(500).json({ error: 'Unable to create form' });
    }
};
exports.createForm = createForm;
const getForms = async (_req, res) => {
    try {
        const forms = await prisma_1.default.form.findMany({
            select: { id: true, name: true, message: true, latitude: true, longitude: true, createdAt: true },
        });
        return res.json(forms);
    }
    catch (err) {
        console.error('Error fetching forms', err);
        return res.status(500).json({ error: 'Unable to fetch forms' });
    }
};
exports.getForms = getForms;
// GET /forms/getLocation -> return only records that have valid coordinates
const getLocation = async (req, res) => {
    try {
        console.log(`[GET /getLocation] request from ${req.ip} at ${new Date().toISOString()}`);
        const rows = await prisma_1.default.form.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
            },
            select: { id: true, latitude: true, longitude: true, name: true, message: true, createdAt: true },
        });
        console.log(`[GET /getLocation] returning ${rows.length} rows`);
        return res.json(rows);
    }
    catch (err) {
        console.error('Error fetching locations', err);
        return res.status(500).json({ error: 'Unable to fetch locations' });
    }
};
exports.getLocation = getLocation;
