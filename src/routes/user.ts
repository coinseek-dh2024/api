import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../auth';

export const userRouter = Router();

userRouter.use(auth);

userRouter.get('/', async (req: Request, res: Response) => {
  console.log('Getting user data');

  const user = await prisma.user.findUnique({
    where: {
      // @ts-ignore
      id: req.userId,
    },
    select: {
      name: true,
    },
  });

  res.json(user);
});

userRouter.patch('/', async (req: Request, res: Response) => {
  console.log('Updating user data', req.body);

  const user = await prisma.user.update({
    // @ts-ignore
    where: { id: req.userId },
    data: {
      name: req.body.name,
    },
    select: {
      name: true,
    },
  });

  res.json(user);
});