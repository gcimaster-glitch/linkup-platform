import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'AI API' }));
export { app as aiRoutes };
