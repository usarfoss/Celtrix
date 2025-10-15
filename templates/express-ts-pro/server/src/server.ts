import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from './setup/rateLimiter';
import { requestLogger } from './setup/requestLogger';
import { errorHandler, notFoundHandler } from './setup/errorHandlers';
import { router as apiRouter } from './setup/routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


