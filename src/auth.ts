import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.sendStatus(401);
  }
  const token = authHeader.split('Bearer ')[1];

  const decToken = await admin.auth().verifyIdToken(token);
  if (!decToken) {
    return res.sendStatus(401);
  }

  req.userId = decToken.uid;

  next();
}
