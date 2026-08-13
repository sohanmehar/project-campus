import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET || 'campusgpt_dev_secret_key_2026',
    { expiresIn: '7d' }
  );
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true, // Immune to XSS script reading
    secure: true,   // Mandatory for sameSite: 'none' over HTTPS
    sameSite: 'none', // Crucial for cross-domain Vercel <-> Render cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
    path: '/',
  });
};