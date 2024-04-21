import { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { getDistance } from 'geolib';
import { auth } from '../auth';

const pickupRadius = 40;

export const locationRouter = Router();

locationRouter.use(auth);

locationRouter.post('/', async (req: Request, res: Response) => {
  console.log('Reporting location', req.body);

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

  if (!req.body) {
    res.status(400).json({ message: 'Location is missing' });
    return;
  }
  const [lat, lng] = req.body.location;

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