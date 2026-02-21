import mongoose from 'mongoose';

import { env } from './config/env';
import app from './app';

export const startServer = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};
