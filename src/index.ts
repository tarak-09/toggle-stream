import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Feature Flag Daemon is running on http://localhost:${PORT}`);
  console.log(`- REST API: http://localhost:${PORT}/api/flags`);
  console.log(`- SSE Stream: http://localhost:${PORT}/api/stream`);
});
