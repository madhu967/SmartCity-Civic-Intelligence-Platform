import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

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

app.use(express.json({ limit: '8mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (_request, response) => {
	response.json({ message: 'Smart City server is running' });
});

connectDB().then(() => {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
});
