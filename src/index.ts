import express, { Request, Response } from 'express';
import admin from 'firebase-admin';
import serviceAccount from '../service-account.json';
import dotenv from 'dotenv';
import { coinRouter } from './routes/coins';
import { locationRouter } from './routes/location';
import { userRouter } from './routes/user';
import cron from 'node-cron';
import { spawnCoins } from './spawn';
import { friendRouter } from './routes/friends';

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

cron.schedule('*/5 * * * *', async () => {
  await spawnCoins();
});

app.use(express.json());

app.post('/coins', async (req: Request, res: Response) => {
  await spawnCoins();
  res.status(200).end();
});

app.use('/coins', coinRouter);
app.use('/location', locationRouter);
app.use('/user', userRouter);
app.use('/friends', friendRouter);

app.get('/', (req, res) => {
  res.send('healthy');
});


app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
