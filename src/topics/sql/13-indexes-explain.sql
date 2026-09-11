-- ============================================================================
-- 13 — INDEXES & EXPLAIN
-- Indexes speed reads (at write/space cost). EXPLAIN shows the planner's choice;
-- EXPLAIN ANALYZE actually runs it and reports real timings + rows.
-- ============================================================================
DROP TABLE IF EXISTS demo_users CASCADE;
CREATE TABLE demo_users (
  id SERIAL PRIMARY KEY,
  email TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bulk data so the planner has a reason to use indexes.
INSERT INTO demo_users (email, status)
SELECT 'user' || g || '@x.com',
       CASE WHEN g % 10 = 0 THEN 'inactive' ELSE 'active' END
FROM generate_series(1, 50000) g;
ANALYZE demo_users;   -- refresh planner statistics

-- Before index: expect a Seq Scan.
EXPLAIN ANALYZE SELECT * FROM demo_users WHERE email = 'user12345@x.com';

-- B-tree index on email -> Index Scan.
CREATE INDEX idx_users_email ON demo_users(email);
ANALYZE demo_users;
EXPLAIN ANALYZE SELECT * FROM demo_users WHERE email = 'user12345@x.com';

-- Composite index: leftmost-prefix rule (status, created_at).
CREATE INDEX idx_users_status_created ON demo_users(status, created_at DESC);
EXPLAIN ANALYZE
SELECT * FROM demo_users WHERE status = 'active' ORDER BY created_at DESC LIMIT 10;

-- Partial index: only the rows you actually query (smaller, faster).
CREATE INDEX idx_users_inactive ON demo_users(email) WHERE status = 'inactive';
EXPLAIN ANALYZE SELECT * FROM demo_users WHERE status='inactive' AND email LIKE 'user1%';

-- Covering index (INCLUDE) -> Index Only Scan (no heap fetch).
CREATE INDEX idx_users_email_incl ON demo_users(email) INCLUDE (status);
EXPLAIN ANALYZE SELECT email, status FROM demo_users WHERE email = 'user99@x.com';

-- Reading a plan: look for Seq Scan on big tables (missing index), estimated vs
-- actual rows (stale stats -> ANALYZE), expensive Sort/Nested Loop.

DROP TABLE demo_users CASCADE;
