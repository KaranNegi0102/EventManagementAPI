import express from 'express';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/events', eventRoutes);

app.get('/', (_req, res) => {
  res.send('test');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
