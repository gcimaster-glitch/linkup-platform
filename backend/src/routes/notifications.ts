import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Notifications API' }));
export { app as notificationRoutes };
