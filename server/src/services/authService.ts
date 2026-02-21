import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import * as usersRepo from '../repositories/usersRepository';

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
}) => {
  const existing = await usersRepo.findByEmail(payload.email);
  if (existing) {
    const error = new Error('Email already registered');
    (error as Error & { status?: number }).status = 409;
    throw error;
  }
  if (payload.role === 'admin') {
    const adminCount = await usersRepo.countByRole('admin');
    if (adminCount > 0) {
      const error = new Error('Admin already exists');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }
  }
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const status = payload.role === 'super_admin' ? 'approved' : 'pending';
  const user = await usersRepo.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    role: payload.role,
    status,
    phone: payload.phone,
    address: payload.address,
    companyName: payload.companyName,
    gstNumber: payload.gstNumber
  });
  return user;
};

export const login = async (email: string, password: string) => {
  const user = await usersRepo.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
  if (user.status !== 'approved') {
    const error = new Error('Account pending approval');
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const error = new Error('Invalid credentials');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
  const token = jwt.sign({ sub: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: '7d'
  });
  return { token, user };
};

export const getMe = (userId: string) => usersRepo.findById(userId);

export const updateMe = async (userId: string, payload: Record<string, unknown>) => {
  const allowed = ['name', 'phone', 'address', 'companyName', 'gstNumber'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      updates[key] = payload[key];
    }
  }
  return usersRepo.updateById(userId, updates);
};
