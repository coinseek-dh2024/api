import { LatLng, LatLngLiteral } from '@googlemaps/google-maps-services-js';
import { mapsApiKey } from '.';
import { generateRandomPoint, maps } from './geo';
import { prisma } from './prisma';
import _ from 'lodash';

const radius = 1000;
const randomCoinLimit = 10;
const placeCoinLimit = 5;

export async function spawnCoins() {
  console.log('Spawning coins for all users');

  const users = await prisma.user.findMany({
    where: { centerPoint: { isEmpty: false } },
    select: { id: true },
  });

  await Promise.all(users.map((u) => spawnCoinsForUser(u.id)));
}

export async function spawnCoinsForUser(userId: string) {
  console.log('Spawning coins for', userId);

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

  if (randomCoinLimit - coinCount <= 0) {
    return;
  }

  const randomPoints: LatLngLiteral[] = [];
  for (let i = 0; i < randomCoinLimit - coinCount; i++) {
    randomPoints.push(
      generateRandomPoint(
        { lat: user.centerPoint[0], lng: user.centerPoint[1] },
        radius,
      ),
    );
  }

  const res = await maps.snapToRoads({
    params: { path: randomPoints, key: mapsApiKey },
  });

  const points = res.data.snappedPoints.map((p) => ({
    location: [p.location.latitude, p.location.longitude],
    type: 'random',
    value: 1,
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

  if (placeCoinLimit - coinCount <= 0) {
    return;
  }

  const loc = { lat: user.centerPoint[0], lng: user.centerPoint[1] };

  const nearLocations = await getPlacesNearby(loc, true);
  // if (nearLocations.length == 0) {
  //   nearLocations = await getPlacesNearby(loc, true);
  // }

  const points = _.sampleSize(nearLocations, placeCoinLimit - coinCount).map(
    (p) => ({
      location: [p.geometry!.location.lat, p.geometry!.location.lng],
      type: 'place',
      value: 3,
      userId,
    }),
  );


  await prisma.coin.createMany({ data: points });
}

async function getPlacesNearby(location: LatLng, all: boolean = false) {
  const types = [
    'art_gallery',
    'museum',
    'performing_arts_theater',
  ];
  const type = _.sample(types);

  const nearby = await maps.placesNearby({
    params: {
      location,
      radius: radius,
      type: all ? undefined : type,
      key: mapsApiKey,
    },
  });
  return nearby.data.results;
}