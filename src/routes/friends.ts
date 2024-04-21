import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../auth';

export const friendRouter = Router();

friendRouter.use(auth);

friendRouter.post('/request', async (req: Request, res: Response) => {
  const email: string = req.body.email;
  if (!email) {
    return res.status(400).json({ message: 'Email is missing' });
  }

  const friend = await prisma.user.findUnique({
    where: { email },
  });
  if (!friend) {
    return res.status(404).json({ message: 'User not found' });
  }

  await prisma.user.update({
    where: {
      id: req.userId,
    },
    data: {
      outgoingFriendRequests: {
        connect: { id: friend.id },
      },
    },
  });
});

friendRouter.get('/requests', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      incomingFriendRequests: {
        select: {
          email: true,
          name: true,
          balance: true,
        },
        orderBy: { balance: 'desc' },
      },
    },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user.incomingFriendRequests);
});

friendRouter.post('/accept', async (req: Request, res: Response) => {
  const email: string = req.body.email;
  if (!email) {
    return res.status(400).json({ message: 'Email is missing' });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: req.userId,
      incomingFriendRequests: { some: { email } },
    },
  });
  if (!user) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  await prisma.user.update({
    where: {
      id: req.userId,
      incomingFriendRequests: { some: { email } },
    },
    data: {
      incomingFriendRequests: { disconnect: { email } },
      friendOf: { connect: { email } },
    },
  });
});

friendRouter.get('/', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      friends: {
        select: {
          name: true,
          balance: true,
        },
        orderBy: { balance: 'desc' },
      },
    },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user.friends);
});