import express, { json } from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import 'dotenv/config';

import './config/passport';
const app = express();
const port = 3000;
app
  .use(cors())
  .use(json())
  .use(
    session({
      secret: process.env.SESSION_SECRET || '',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false
      }
    })
  )
  .use(passport.initialize())
  .use(passport.session());
app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});
import { authRouter } from './routes/auth.routes';
app.use('/api/v1/auth', authRouter);
app.get('/session-info', (req, res) => {
  res.json(req.session);
});
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
