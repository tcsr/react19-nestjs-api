-- ============================================================================
-- 01 — JOINS (all types)
-- Run: psql/pgAdmin, or  npx prisma db execute --file src/topics/sql/01-joins.sql --schema prisma/schema.prisma
-- Self-contained: creates + drops its own demo_* tables.
-- ============================================================================
DROP TABLE IF EXISTS demo_emp, demo_dept CASCADE;

CREATE TABLE demo_dept (id INT PRIMARY KEY, name TEXT);
CREATE TABLE demo_emp (
  id INT PRIMARY KEY, name TEXT, dept_id INT, manager_id INT
);

INSERT INTO demo_dept VALUES (1,'Eng'), (2,'Sales'), (3,'Empty');
INSERT INTO demo_emp VALUES
  (1,'Ada',1,NULL), (2,'Alan',1,1), (3,'Grace',2,1), (4,'NoDept',NULL,1);

-- INNER JOIN: only matching rows on both sides.
SELECT e.name, d.name AS dept
FROM demo_emp e
JOIN demo_dept d ON d.id = e.dept_id;

-- LEFT JOIN: all employees, dept NULL when unmatched (NoDept shows).
SELECT e.name, d.name AS dept
FROM demo_emp e
LEFT JOIN demo_dept d ON d.id = e.dept_id;

-- RIGHT JOIN: all depts, employees NULL when unmatched (Empty dept shows).
SELECT e.name, d.name AS dept
FROM demo_emp e
RIGHT JOIN demo_dept d ON d.id = e.dept_id;

-- FULL OUTER JOIN: everything from both, NULLs where no match.
SELECT e.name, d.name AS dept
FROM demo_emp e
FULL JOIN demo_dept d ON d.id = e.dept_id;

-- CROSS JOIN: cartesian product (every emp × every dept).
SELECT e.name, d.name FROM demo_emp e CROSS JOIN demo_dept d;

-- SELF JOIN: table joined to itself (employee -> manager).
SELECT e.name AS emp, m.name AS manager
FROM demo_emp e
LEFT JOIN demo_emp m ON m.id = e.manager_id;

-- LATERAL JOIN: right side references the left row (per-row subquery).
-- Here: each dept with its first employee by id.
SELECT d.name, first_emp.name
FROM demo_dept d
LEFT JOIN LATERAL (
  SELECT name FROM demo_emp e WHERE e.dept_id = d.id ORDER BY id LIMIT 1
) AS first_emp ON true;

-- Anti-join (rows with NO match) via LEFT JOIN ... IS NULL:
SELECT e.name FROM demo_emp e
LEFT JOIN demo_dept d ON d.id = e.dept_id
WHERE d.id IS NULL;

DROP TABLE demo_emp, demo_dept CASCADE;
