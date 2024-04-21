import admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';
import { prisma } from './prisma';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: 'Token missing from authorization header' });
  }
  const token = authHeader.split('Bearer ')[1];

  const decToken = await admin.auth().verifyIdToken(token).catch(() => {
    console.error('Failed to verify token');
  });
  if (!decToken) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.userId = decToken.uid;

  const user = await prisma.user.findUnique({
    where: { id: decToken.uid },
  });
  if (!user) {
    await prisma.user.create({
      data: { id: decToken.uid },
    });
  }

  next();
}

export async function authFake(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = 'testuser123';

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    await prisma.user.create({
      data: { id: userId },
    });
  }

  // @ts-ignore
  req.userId = userId;

  next();
}
