import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/user.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({}));
app.use(express.urlencoded({extended: true}));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
// app.use('/questions', questionRoutes);

app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ping from WebInt Backend"
  })
});

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));