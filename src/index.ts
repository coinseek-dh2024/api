import express, { Request, Response } from 'express';
import { auth } from './auth';
import { prisma } from './prisma';

const app = express();
const port = 3000;

app.use(auth);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('healthy');
});

app.patch('/user', async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      username: req.body.username,
      name: req.body.user,
    },
    select: { username: true, name: true },
  });

  res.json(user);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
