import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (_request, response) => {
	response.json({ message: 'Smart City server is running' });
});

connectDB().then(() => {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
});
