-- ============================================================================
-- 14 — PAGINATION (offset vs keyset/cursor)
-- OFFSET is simple but SLOW on deep pages (scans + discards skipped rows) and can
-- skip/duplicate rows if data changes between pages. KEYSET ("seek") pagination
-- uses the last row's key -> constant time, stable under inserts. Preferred for
-- large/infinite lists (this is what the frontend cursor pagination maps to).
-- ============================================================================
DROP TABLE IF EXISTS demo_feed CASCADE;
CREATE TABLE demo_feed (id SERIAL PRIMARY KEY, title TEXT, created_at TIMESTAMPTZ DEFAULT now());
INSERT INTO demo_feed (title)
SELECT 'post ' || g FROM generate_series(1, 100) g;

-- OFFSET pagination: page 3, size 10 (skips 20). Simple; degrades on deep offsets.
SELECT id, title FROM demo_feed ORDER BY id LIMIT 10 OFFSET 20;

-- KEYSET pagination: "give me 10 after id 20". No OFFSET scan; index-friendly.
SELECT id, title FROM demo_feed
WHERE id > 20            -- last id from the previous page (the cursor)
ORDER BY id
LIMIT 10;

-- Keyset on a non-unique sort key needs a tiebreaker (composite cursor):
-- WHERE (created_at, id) > (:last_created_at, :last_id) ORDER BY created_at, id
SELECT id, title, created_at FROM demo_feed
WHERE (created_at, id) > ('-infinity'::timestamptz, 0)
ORDER BY created_at, id
LIMIT 5;

-- Total count for OFFSET UIs (expensive on big tables — consider approx or cache):
SELECT count(*) FROM demo_feed;

DROP TABLE demo_feed CASCADE;
