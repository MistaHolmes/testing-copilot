import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createForm = async (req: Request, res: Response) => {
  try {
    const { name, email, message, latitude, longitude } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const data: any = { name, email, message };
    if (typeof latitude === 'number') data.latitude = latitude;
    if (typeof longitude === 'number') data.longitude = longitude;

    const created = await prisma.form.create({
      data,
    });

    console.log('Form submitted:', created.id);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error creating form', err);
    return res.status(500).json({ error: 'Unable to create form' });
  }
};

export const getForms = async (_req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany({
      select: { id: true, name: true, message: true, latitude: true, longitude: true, createdAt: true },
    });
    return res.json(forms);
  } catch (err) {
    console.error('Error fetching forms', err);
    return res.status(500).json({ error: 'Unable to fetch forms' });
  }
};

// GET /forms/getLocation -> return only records that have valid coordinates
export const getLocation = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.form.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { id: true, latitude: true, longitude: true, name: true, message: true, createdAt: true },
    });
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching locations', err);
    return res.status(500).json({ error: 'Unable to fetch locations' });
  }
};
