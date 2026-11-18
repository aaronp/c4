// The app itself. Its architecture lives in c4/architecture.md.
const server = Bun.serve({ port: 3000, fetch: () => new Response('Hello from bun-app') });
console.log(`Listening on ${server.url}`);
