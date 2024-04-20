import express, { Request, Response } from 'express';
import { authFake } from './auth';
import { prisma } from './prisma';
import admin from 'firebase-admin';
import serviceAccount from '../service-account.json';
import dotenv from 'dotenv';
import { coinRouter } from './routes/coins';
import { locationRouter } from './routes/location';

dotenv.config();

if (!process.env.GOOGLE_MAPS_API_KEY) {
  throw Error('Google maps api key is not defined');
}
export const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});

const app = express();
const port = 3000;

// app.use(auth);
app.use(authFake);
app.use(express.json());

app.use('/coins', coinRouter);
app.use('/location', locationRouter);

app.get('/', (req, res) => {
  res.send('healthy');
});

app.patch('/user', async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    // @ts-ignore
    where: { id: req.userId },
    data: {
      username: req.body.username,
      name: req.body.name,
    },
    select: { username: true, name: true },
  });

  res.json(user);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
