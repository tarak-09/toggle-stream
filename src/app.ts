import express from 'express';
import cors from 'cors';
import flagRoutes from './routes/flags';
import sseRoutes from './routes/sse';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/flags', flagRoutes);
app.use('/api/stream', sseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
