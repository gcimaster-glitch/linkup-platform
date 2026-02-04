ALTER TABLE organizer_profiles ADD COLUMN type TEXT CHECK(type IN ('corporate', 'npo', 'individual')) DEFAULT 'corporate';
