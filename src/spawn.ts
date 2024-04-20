import { PlacesNearbyRanking } from '@googlemaps/google-maps-services-js';
import { mapsApiKey } from '.';
import { generateRandomPoint, maps } from './geo';
import { prisma } from './prisma';
import { sampleSize } from 'lodash';

const radius = 1000;
const randomCoinLimit = 20;
const placeCoinLimit = 5;

export async function spawnCoins() {
  const users = await prisma.user.findMany({
    where: { centerPoint: { isEmpty: false } },
    select: { id: true },
  });

  await Promise.all(users.map((u) => spawnCoinsForUser(u.id)));
}

export async function spawnCoinsForUser(userId: string) {
  await spawnRandomCoins(userId);
  await spawnPlaceCoins(userId);
}

async function spawnRandomCoins(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Error('User does not exist');
  if (!user.centerPoint) throw Error('User has no center point defined');

  const coinCount = await prisma.coin.count({
    where: { userId, type: 'random' },
  });

  const randomPoints = new Array(randomCoinLimit - coinCount).map(() =>
    generateRandomPoint(
      { lat: user.centerPoint[0], lng: user.centerPoint[1] },
      radius,
    ),
  );

  const res = await maps.snapToRoads({
    params: { path: randomPoints, key: mapsApiKey },
  });
  const points = res.data.snappedPoints.map((p) => ({
    location: [p.location.latitude, p.location.longitude],
    type: 'random',
    userId,
  }));

  await prisma.coin.createMany({ data: points });
}

async function spawnPlaceCoins(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Error('User does not exist');
  if (!user.centerPoint) throw Error('User has no center point defined');

  const coinCount = await prisma.coin.count({
    where: { userId, type: 'place' },
  });

  const nearby = await maps.placesNearby({
    params: {
      location: { lat: user.centerPoint[0], lng: user.centerPoint[1] },
      radius: radius,
      rankby: PlacesNearbyRanking.distance,
      key: mapsApiKey,
    },
  });
  const nearLocations = nearby.data.results;

  const points = sampleSize(nearLocations, placeCoinLimit - coinCount).map(
    (p) => ({
      location: [p.geometry!.location.lat, p.geometry!.location.lng],
      type: 'place',
      userId,
    }),
  );

  await prisma.coin.createMany({ data: points });
}
