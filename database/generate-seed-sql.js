// ========================================
// Seed Data SQL Generator
// ========================================
// Converts seed.json to executable SQL
// ========================================

const fs = require('fs');
const path = require('path');

console.log('🌱 Generating seed SQL from JSON...\n');

// Read seed data
const seedPath = path.join(__dirname, '../data/seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

let sql = `-- ========================================
-- LinkUp Platform Seed Data
-- ========================================
-- Generated: ${new Date().toISOString()}
-- Source: data/seed.json
-- ========================================

`;

// Helper: Escape SQL string
function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Insert category_images
sql += `\n-- Category Images\n`;
sql += `DELETE FROM category_images;\n`;
for (const img of seed.category_images) {
  sql += `INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES (${escapeSQL(img.category)}, ${escapeSQL(img.image_url)}, ${escapeSQL(img.thumbnail_url)}, ${escapeSQL(img.description)});\n`;
}

// Insert users  
sql += `\n-- Users\n`;
sql += `DELETE FROM users WHERE user_id LIKE 'usr_demo_%' OR user_id LIKE 'usr_organizer_%' OR user_id LIKE 'usr_admin_%';\n`;
for (const user of seed.users) {
  sql += `INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES (${escapeSQL(user.user_id)}, ${escapeSQL(user.email)}, ${escapeSQL(user.name)}, ${escapeSQL(user.user_type)}, ${escapeSQL(user.bio || null)}, ${user.verified || 0});\n`;
}

// Insert venues
sql += `\n-- Venues\n`;
sql += `DELETE FROM venues WHERE venue_id LIKE 'v-%';\n`;
for (const venue of seed.venues) {
  sql += `INSERT INTO venues (venue_id, name, address, lat, lng, capacity, layout_rows, layout_cols) VALUES (${escapeSQL(venue.venue_id)}, ${escapeSQL(venue.name)}, ${escapeSQL(venue.address)}, ${venue.lat || 'NULL'}, ${venue.lng || 'NULL'}, ${venue.capacity || 'NULL'}, ${venue.layout_rows || 'NULL'}, ${venue.layout_cols || 'NULL'});\n`;
}

// Insert events
sql += `\n-- Events\n`;
sql += `DELETE FROM events WHERE event_id LIKE 'evt_demo_%';\n`;
for (const event of seed.events) {
  sql += `INSERT INTO events (event_id, title, description, category, cover_image_url, venue_id, venue_name, venue_address, lat, lng, start_datetime, end_datetime, organizer_id, organizer_name, organizer_rating, status, max_attendees, current_attendees, is_online, tags) VALUES (${escapeSQL(event.event_id)}, ${escapeSQL(event.title)}, ${escapeSQL(event.description)}, ${escapeSQL(event.category)}, ${escapeSQL(event.cover_image_url)}, ${escapeSQL(event.venue_id)}, ${escapeSQL(event.venue_name)}, ${escapeSQL(event.venue_address)}, ${event.lat || 'NULL'}, ${event.lng || 'NULL'}, ${escapeSQL(event.start_datetime)}, ${escapeSQL(event.end_datetime)}, ${escapeSQL(event.organizer_id)}, ${escapeSQL(event.organizer_name)}, ${event.organizer_rating}, ${escapeSQL(event.status)}, ${event.max_attendees}, ${event.current_attendees}, ${event.is_online}, ${escapeSQL(event.tags)});\n`;
}

// Insert tickets
sql += `\n-- Tickets\n`;
sql += `DELETE FROM tickets WHERE ticket_id LIKE 'tkt_demo_%';\n`;
for (const ticket of seed.tickets) {
  sql += `INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES (${escapeSQL(ticket.ticket_id)}, ${escapeSQL(ticket.event_id)}, ${escapeSQL(ticket.ticket_type)}, ${escapeSQL(ticket.ticket_name)}, ${ticket.price}, ${ticket.quantity}, ${ticket.sold_count}, ${ticket.purchase_limit}, ${escapeSQL(ticket.description)}, ${ticket.is_reserved_seating}, ${escapeSQL(ticket.status)});\n`;
}

sql += `\n-- ========================================\n`;
sql += `-- Seed data insertion complete\n`;
sql += `-- ========================================\n`;

// Write SQL file
const outputPath = path.join(__dirname, 'seed.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log('✅ Seed SQL generated successfully');
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Statistics:`);
console.log(`   - Category Images: ${seed.category_images.length}`);
console.log(`   - Users: ${seed.users.length}`);
console.log(`   - Venues: ${seed.venues.length}`);
console.log(`   - Events: ${seed.events.length}`);
console.log(`   - Tickets: ${seed.tickets.length}`);
console.log('');
