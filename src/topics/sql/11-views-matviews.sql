-- ============================================================================
-- 11 — VIEWS & MATERIALIZED VIEWS
-- VIEW: a stored query (virtual table), always live, no storage — simplify/reuse
-- complex queries, encapsulate logic, restrict columns.
-- MATERIALIZED VIEW: stores the result on disk (fast reads) but is STALE until
-- REFRESH — use for expensive aggregates that don't need to be real-time.
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS demo_sales_mv;
DROP VIEW IF EXISTS demo_sales_v;
DROP TABLE IF EXISTS demo_sales CASCADE;

CREATE TABLE demo_sales (id INT, region TEXT, amount NUMERIC);
INSERT INTO demo_sales VALUES (1,'US',100),(2,'US',50),(3,'EU',200);

-- VIEW: always reflects the current table.
CREATE VIEW demo_sales_v AS
SELECT region, SUM(amount) AS total FROM demo_sales GROUP BY region;
SELECT * FROM demo_sales_v ORDER BY region;

INSERT INTO demo_sales VALUES (4,'US',25);
SELECT * FROM demo_sales_v WHERE region='US';   -- 175 (live, includes new row)

-- MATERIALIZED VIEW: snapshot; needs REFRESH to update.
CREATE MATERIALIZED VIEW demo_sales_mv AS
SELECT region, SUM(amount) AS total FROM demo_sales GROUP BY region;

INSERT INTO demo_sales VALUES (5,'EU',300);
SELECT * FROM demo_sales_mv WHERE region='EU';  -- still 200 (STALE)

REFRESH MATERIALIZED VIEW demo_sales_mv;         -- recompute
SELECT * FROM demo_sales_mv WHERE region='EU';  -- now 500
-- A UNIQUE index on a matview enables REFRESH ... CONCURRENTLY (no read lock).

DROP MATERIALIZED VIEW demo_sales_mv;
DROP VIEW demo_sales_v;
DROP TABLE demo_sales CASCADE;
