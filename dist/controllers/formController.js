"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForm = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'name, email and message are required' });
        }
        const created = await prisma_1.default.form.create({
            data: { name, email, message },
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
