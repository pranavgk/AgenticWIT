import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Start server
async function start() {
  try {
    const server = await buildApp();
    await server.listen({ port: PORT, host: HOST });
    
    console.log(`
🚀 AgenticWIT Backend API is running!
    
📍 Server: http://${HOST}:${PORT}
🏥 Health: http://${HOST}:${PORT}/health
📚 API Info: http://${HOST}:${PORT}/api
🌍 Environment: ${process.env.NODE_ENV || 'development'}

Press CTRL+C to stop
    `);

    // Handle shutdown gracefully
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n${signal} received, closing server gracefully...`);
        await server.close();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Start the server
start();
