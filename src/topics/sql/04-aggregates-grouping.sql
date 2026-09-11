-- ============================================================================
-- 04 — AGGREGATES & GROUPING (FILTER, DISTINCT ON, string_agg, ROLLUP/CUBE, CASE)
-- ============================================================================
DROP TABLE IF EXISTS demo_sales CASCADE;
CREATE TABLE demo_sales (id INT, region TEXT, product TEXT, amount NUMERIC);
INSERT INTO demo_sales VALUES
 (1,'US','pen',10),(2,'US','pen',20),(3,'US','ink',5),
 (4,'EU','pen',30),(5,'EU','ink',15),(6,'EU','ink',15);

-- Basic aggregates + HAVING (filter groups).
SELECT region, COUNT(*) n, SUM(amount) total, AVG(amount) avg
FROM demo_sales GROUP BY region HAVING SUM(amount) > 30;

-- FILTER: conditional aggregate within one pass (vs CASE-in-SUM).
SELECT
  region,
  SUM(amount) AS total,
  SUM(amount) FILTER (WHERE product = 'pen') AS pens,
  COUNT(*)    FILTER (WHERE amount > 15)      AS big
FROM demo_sales GROUP BY region;

-- CASE inside aggregate (bucketing).
SELECT
  SUM(CASE WHEN amount >= 20 THEN 1 ELSE 0 END) AS big_count,
  SUM(CASE WHEN amount <  20 THEN 1 ELSE 0 END) AS small_count
FROM demo_sales;

-- string_agg / array_agg: collapse rows into a list per group.
SELECT region, string_agg(DISTINCT product, ', ' ORDER BY product) AS products,
       array_agg(amount ORDER BY amount) AS amounts
FROM demo_sales GROUP BY region;

-- DISTINCT ON: first row per group (Postgres-specific).
SELECT DISTINCT ON (region) region, product, amount
FROM demo_sales ORDER BY region, amount DESC;   -- top-amount row per region

-- ROLLUP: subtotals + grand total. (CUBE = all combinations; GROUPING SETS = custom.)
SELECT region, product, SUM(amount)
FROM demo_sales GROUP BY ROLLUP (region, product) ORDER BY region, product;

DROP TABLE demo_sales CASCADE;
