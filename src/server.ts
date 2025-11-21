import http from 'http';
import app from './app';
import gracefulShutdown from './utils/shutdown';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

// Provide a simple cleanup function for gracefulShutdown (placeholder for db disconnects)
const cleanup = async () => {
	// put async cleanup here (close DB pools, flush queues, etc.)
	return Promise.resolve();
};

// Wire graceful shutdown
gracefulShutdown(server, cleanup);

export default server;
