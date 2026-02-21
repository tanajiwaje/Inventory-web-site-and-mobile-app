import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import routes from './routes';
import authRoutes from './routes/auth.routes';
import publicRoutes from './routes/public.routes';
import { authenticate } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', authenticate, routes);

// Basic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
