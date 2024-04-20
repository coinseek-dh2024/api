import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';

export const coinRouter = Router();

coinRouter.get('/', async (req: Request, res: Response) => {
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
