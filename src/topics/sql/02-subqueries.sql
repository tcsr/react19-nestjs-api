-- ============================================================================
-- 02 — SUBQUERIES (scalar, IN, EXISTS, correlated, ANY/ALL, derived table)
-- ============================================================================
DROP TABLE IF EXISTS demo_orders, demo_customers CASCADE;
CREATE TABLE demo_customers (id INT PRIMARY KEY, name TEXT, country TEXT);
CREATE TABLE demo_orders (id INT PRIMARY KEY, customer_id INT, amount NUMERIC);

INSERT INTO demo_customers VALUES (1,'Ada','UK'),(2,'Alan','UK'),(3,'Grace','US');
INSERT INTO demo_orders VALUES (1,1,100),(2,1,50),(3,3,200);

-- SCALAR subquery: returns a single value used inline.
SELECT name, (SELECT COUNT(*) FROM demo_orders o WHERE o.customer_id = c.id) AS orders
FROM demo_customers c;

-- IN: membership against a subquery result set.
SELECT name FROM demo_customers
WHERE id IN (SELECT customer_id FROM demo_orders);

-- NOT EXISTS: customers with no orders (correlated).
SELECT name FROM demo_customers c
WHERE NOT EXISTS (SELECT 1 FROM demo_orders o WHERE o.customer_id = c.id);

-- Correlated subquery: order above that customer's average.
SELECT o.* FROM demo_orders o
WHERE o.amount > (
  SELECT AVG(amount) FROM demo_orders x WHERE x.customer_id = o.customer_id
);

-- ANY / ALL: compare to a set.
SELECT name FROM demo_orders o JOIN demo_customers c ON c.id=o.customer_id
WHERE amount > ALL (SELECT amount FROM demo_orders WHERE customer_id = 1); -- beats every cust-1 order

-- Derived table (subquery in FROM) + join.
SELECT c.name, t.total
FROM demo_customers c
JOIN (SELECT customer_id, SUM(amount) total FROM demo_orders GROUP BY customer_id) t
  ON t.customer_id = c.id;

DROP TABLE demo_orders, demo_customers CASCADE;
