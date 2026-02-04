-- Demo Users Seed Data
-- 1. Organizer: LinkUp Official
INSERT OR IGNORE INTO users (user_id, email, password_hash, display_name, role, kyc_status, avatar_url) VALUES 
('u-organizer-001', 'organizer@demo.com', '$2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6', 'LinkUp Official', 'organizer', 'verified', 'https://ui-avatars.com/api/?name=LinkUp+Official&background=2563EB&color=fff');

-- 2. Attendee: Demo User
INSERT OR IGNORE INTO users (user_id, email, password_hash, display_name, role, kyc_status, avatar_url) VALUES 
('u-user-001', 'user@demo.com', '$2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6', 'Demo User', 'attendee', 'verified', 'https://ui-avatars.com/api/?name=Demo+User&background=random');

-- Organizer Profile
INSERT OR IGNORE INTO organizer_profiles (organizer_id, organization_name, description, rating, stripe_onboarding_completed) VALUES
('u-organizer-001', 'LinkUp Official', 'Official Organizer Account for LinkUp Platform.', 4.8, 1);
