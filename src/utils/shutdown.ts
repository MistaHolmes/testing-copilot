export default function gracefulShutdown(server: any, cleanup: () => Promise<void>) {
    const shutdown = async () => {
        console.log('Received shutdown signal, closing HTTP server gracefully...');
        await cleanup();
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}