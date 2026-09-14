import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use((request, response, next) => {
	const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

	response.header('Access-Control-Allow-Origin', allowedOrigin);
	response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (request.method === 'OPTIONS') {
		return response.sendStatus(204);
	}

	return next();
});

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
