import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../auth';

export const coinRouter = Router();

coinRouter.use(auth);

// Get all available coins for user
coinRouter.get('/', async (req: Request, res: Response) => {
  console.log('Getting coins');

  const coins = await prisma.coin.findMany({
    // @ts-ignore
    where: { userId: req.userId },
    select: {
      id: true,
      location: true,
      type: true,
      value: true,
    },
  });

  res.json(coins);
});

