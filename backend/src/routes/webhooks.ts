import { Hono } from 'hono';
const app = new Hono();
app.post('/stripe', (c) => c.json({ received: true }));
export { app as webhookRoutes };
