import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (_request, response) => {
	response.json({ message: 'Smart City server is running' });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
