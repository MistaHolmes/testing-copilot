import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createForm = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const created = await prisma.form.create({
      data: { name, email, message },
    });

    console.log('Form submitted:', created.id);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error creating form', err);
    return res.status(500).json({ error: 'Unable to create form' });
  }
};
