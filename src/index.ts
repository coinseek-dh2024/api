import express from 'express';
import { auth } from './auth.js';

const app = express();
const port = 3000;

// app.use(auth);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('healthy');
});

app.patch('/user', (req, res) => {
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
