import 'dotenv/config';

import express from 'express';
import dicomRoutes from './src/api/dicom/route.js';
import { middleware } from './middleware/middleware.js';

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use('/api/dicom', middleware, dicomRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
