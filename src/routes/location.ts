import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { getDistance } from 'geolib';

const pickupRadius = 40;

export const locationRouter = Router();

locationRouter.post('/', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: req.userId },
    include: {
      coins: {
        select: {
          id: true,
          location: true,
          value: true,
        },
      },
    },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const { lat, lng } = req.body;
  if (lat == undefined || lng == undefined) {
    res.status(400).json({ message: 'Location is missing' });
    return;
  }

  const pickedUp = user.coins.filter((c) => getDistance(
      { lat: c.location[0], lng: c.location[1] },
      { lat, lng },
    ) < pickupRadius,
  );

  const newBalance = user.balance + pickedUp.reduce((sum, coin) => sum + coin.value, 0);

  await prisma.user.update({
    where: {
      // @ts-ignore
      id: req.userId,
    },
    data: {
      balance: newBalance,
    },
  });

  await prisma.coin.deleteMany({
    where: { id: { in: pickedUp.map((p) => p.id) } },
  });

  res.json(pickedUp);
});