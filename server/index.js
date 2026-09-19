import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use((request, response, next) => {
	const requestOrigin = request.headers.origin;

	const envOrigins = (process.env.CLIENT_URL || '')
		.split(',')
		.map((url) => url.trim().replace(/\/+$/, ''))
		.filter(Boolean);

	const defaultOrigins = [
		'http://localhost:5173',
		'http://localhost:3000',
		'http://127.0.0.1:5173',
		'http://127.0.0.1:3000',
		'https://smart-city-civic-intelligence-platf-kohl.vercel.app',
	];

	const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

	const isLocalhost = Boolean(
		requestOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
	);
	const isVercel = Boolean(
		requestOrigin && /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(requestOrigin)
	);
	const isAllowed =
		requestOrigin && (allowedOrigins.has(requestOrigin) || isLocalhost || isVercel);

	if (isAllowed) {
		response.header('Access-Control-Allow-Origin', requestOrigin);
		response.header('Access-Control-Allow-Credentials', 'true');
	} else if (!requestOrigin) {
		response.header('Access-Control-Allow-Origin', '*');
	} else {
		response.header('Access-Control-Allow-Origin', envOrigins[0] || 'http://localhost:5173');
	}

	response.header('Vary', 'Origin');
	response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	response.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, X-Requested-With, Accept, Origin'
	);
	response.header('Access-Control-Max-Age', '86400');

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
app.use('/api/contact', contactRoutes);

app.get('/', (_request, response) => {
	response.json({ message: 'Smart City server is running' });
});

connectDB().then(() => {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
});
