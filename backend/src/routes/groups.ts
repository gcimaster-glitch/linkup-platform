import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Groups API' }));
export { app as groupRoutes };
