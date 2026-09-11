-- ============================================================================
-- 06 — CTEs & RECURSIVE CTEs
-- WITH names a subquery for readability/reuse. WITH RECURSIVE walks hierarchies
-- (org charts, categories, graphs) — a base case UNION ALL a recursive step.
-- ============================================================================
DROP TABLE IF EXISTS demo_emp CASCADE;
CREATE TABLE demo_emp (id INT PRIMARY KEY, name TEXT, manager_id INT);
INSERT INTO demo_emp VALUES
 (1,'CEO',NULL),(2,'VP-Eng',1),(3,'VP-Sales',1),
 (4,'Dev',2),(5,'Dev2',2),(6,'Rep',3);

-- Plain CTE + reuse.
WITH counts AS (
  SELECT manager_id, COUNT(*) AS reports FROM demo_emp GROUP BY manager_id
)
SELECT e.name, COALESCE(c.reports,0) AS direct_reports
FROM demo_emp e LEFT JOIN counts c ON c.manager_id = e.id
ORDER BY e.id;

-- RECURSIVE: full management chain with depth (org tree from the CEO down).
WITH RECURSIVE tree AS (
  SELECT id, name, manager_id, 1 AS depth, name::text AS path
  FROM demo_emp WHERE manager_id IS NULL          -- base case (root)
  UNION ALL
  SELECT e.id, e.name, e.manager_id, t.depth + 1, t.path || ' > ' || e.name
  FROM demo_emp e JOIN tree t ON e.manager_id = t.id   -- recursive step
)
SELECT depth, path FROM tree ORDER BY path;

DROP TABLE demo_emp CASCADE;
