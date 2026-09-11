-- ============================================================================
-- 03 — SET OPERATIONS (UNION, UNION ALL, INTERSECT, EXCEPT)
-- Combine result sets with matching column count/types. UNION dedupes;
-- UNION ALL keeps duplicates (faster — use when you know rows are distinct).
-- ============================================================================
DROP TABLE IF EXISTS demo_a, demo_b CASCADE;
CREATE TABLE demo_a (val INT);
CREATE TABLE demo_b (val INT);
INSERT INTO demo_a VALUES (1),(2),(3),(3);
INSERT INTO demo_b VALUES (3),(4);

-- UNION: distinct combination.
SELECT val FROM demo_a UNION SELECT val FROM demo_b ORDER BY val;      -- 1,2,3,4

-- UNION ALL: keeps duplicates (note the two 3s from demo_a).
SELECT val FROM demo_a UNION ALL SELECT val FROM demo_b ORDER BY val;  -- 1,2,3,3,3,4

-- INTERSECT: rows in both.
SELECT val FROM demo_a INTERSECT SELECT val FROM demo_b;               -- 3

-- EXCEPT: rows in A not in B (set difference).
SELECT val FROM demo_a EXCEPT SELECT val FROM demo_b ORDER BY val;     -- 1,2

DROP TABLE demo_a, demo_b CASCADE;
