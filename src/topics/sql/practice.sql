-- ============================================================================
-- SQL PRACTICE (PostgreSQL) — runnable reference
-- Run in psql / pgAdmin against a scratch database, or:
--   npx prisma db execute --file src/topics/sql/practice.sql --schema prisma/schema.prisma
-- Covers DDL, DML, constraints, joins, indexes, transactions, CTEs, window fns.
-- Uses its own `demo_*` tables so it won't touch the app's Prisma tables.
-- ============================================================================

-- ---------- DDL: create tables + constraints ----------
DROP TABLE IF EXISTS demo_orders, demo_customers CASCADE;

CREATE TABLE demo_customers (
  id          SERIAL PRIMARY KEY,               -- auto-increment PK
  email       TEXT NOT NULL UNIQUE,             -- UNIQUE constraint
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE demo_orders (
  id           SERIAL PRIMARY KEY,
  customer_id  INT NOT NULL REFERENCES demo_customers(id) ON DELETE CASCADE, -- FK
  amount       NUMERIC(10,2) NOT NULL CHECK (amount >= 0),                    -- CHECK
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Indexes ----------
CREATE INDEX idx_orders_customer ON demo_orders(customer_id);  -- FK/join index
CREATE INDEX idx_orders_status   ON demo_orders(status) WHERE status <> 'done'; -- partial

-- ---------- DML: insert ----------
INSERT INTO demo_customers (email, name) VALUES
  ('a@x.com','Ada'), ('b@x.com','Alan'), ('c@x.com','Grace');

INSERT INTO demo_orders (customer_id, amount, status) VALUES
  (1, 100.00, 'done'), (1, 50.00, 'pending'),
  (2, 200.00, 'done'), (3, 25.00, 'pending'), (3, 75.00, 'done');

-- ---------- Query: JOIN + aggregate + GROUP BY / HAVING ----------
SELECT c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.amount),0) AS total
FROM demo_customers c
LEFT JOIN demo_orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 0
ORDER BY total DESC;

-- ---------- CTE + window function ----------
WITH ranked AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn,
    SUM(amount)  OVER (PARTITION BY customer_id) AS customer_total
  FROM demo_orders o
)
SELECT customer_id, id, amount, customer_total
FROM ranked
WHERE rn = 1;  -- top order per customer

-- ---------- UPDATE / DELETE ----------
UPDATE demo_orders SET status = 'done' WHERE status = 'pending' AND amount < 30;
DELETE FROM demo_orders WHERE amount = 0;

-- ---------- Transaction (atomic) ----------
BEGIN;
  INSERT INTO demo_orders (customer_id, amount) VALUES (2, 500.00);
  UPDATE demo_customers SET name = 'Alan T.' WHERE id = 2;
COMMIT;   -- ROLLBACK; would undo both

-- ---------- EXPLAIN (see the plan; ANALYZE runs it) ----------
EXPLAIN ANALYZE
SELECT * FROM demo_orders WHERE customer_id = 1;  -- should use idx_orders_customer

-- ---------- Cleanup ----------
-- DROP TABLE demo_orders, demo_customers CASCADE;
