-- ============================================================================
-- 09 — FULL-TEXT SEARCH
-- tsvector (normalized document) + tsquery (search terms) with ranking. Far better
-- than LIKE '%x%' for natural-language search: stemming, stop-words, relevance.
-- GIN index on the tsvector makes it fast.
-- ============================================================================
DROP TABLE IF EXISTS demo_articles CASCADE;
CREATE TABLE demo_articles (
  id INT PRIMARY KEY,
  title TEXT,
  body TEXT
);
INSERT INTO demo_articles VALUES
 (1,'Postgres indexing','Learn how B-tree and GIN indexes speed up queries'),
 (2,'Cooking pasta','A quick guide to boiling pasta and making sauce'),
 (3,'Query tuning','Tuning slow database queries with EXPLAIN and indexes');

-- Basic match: to_tsvector + to_tsquery.
SELECT id, title
FROM demo_articles
WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'index & query');

-- plainto_tsquery: treat input as a plain phrase (ANDs the words).
SELECT id, title
FROM demo_articles
WHERE to_tsvector('english', body) @@ plainto_tsquery('english', 'slow queries');

-- Ranking by relevance (ts_rank).
SELECT id, title,
  ts_rank(to_tsvector('english', title || ' ' || body),
          to_tsquery('english', 'index | query')) AS rank
FROM demo_articles
ORDER BY rank DESC;

-- Production: store a generated tsvector column + GIN index.
ALTER TABLE demo_articles
  ADD COLUMN search tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED;
CREATE INDEX idx_articles_search ON demo_articles USING GIN (search);

SELECT id, title FROM demo_articles WHERE search @@ to_tsquery('english', 'pasta');

DROP TABLE demo_articles CASCADE;
