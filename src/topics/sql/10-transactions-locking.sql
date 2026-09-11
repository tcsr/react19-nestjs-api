-- ============================================================================
-- 10 — TRANSACTIONS, ISOLATION & LOCKING
-- A transaction is atomic (all-or-nothing). Isolation level controls what
-- concurrent transactions can see. Locking coordinates concurrent writers.
-- NOTE: the concurrency effects below truly show with TWO sessions running at
-- once; here the statements are annotated so you know what each does.
-- ============================================================================
DROP TABLE IF EXISTS demo_accounts, demo_jobs CASCADE;
CREATE TABLE demo_accounts (id INT PRIMARY KEY, balance NUMERIC NOT NULL);
INSERT INTO demo_accounts VALUES (1,100),(2,0);

-- Atomic transfer: both updates commit together, or neither.
BEGIN;
  UPDATE demo_accounts SET balance = balance - 30 WHERE id = 1;
  UPDATE demo_accounts SET balance = balance + 30 WHERE id = 2;
COMMIT;   -- ROLLBACK; would undo the whole transfer
SELECT * FROM demo_accounts ORDER BY id;   -- 70 / 30

-- SAVEPOINT: partial rollback within a transaction.
BEGIN;
  UPDATE demo_accounts SET balance = balance - 10 WHERE id = 1;
  SAVEPOINT s1;
  UPDATE demo_accounts SET balance = balance - 999999 WHERE id = 1; -- oops
  ROLLBACK TO s1;   -- undo only the bad update
COMMIT;

-- ISOLATION LEVELS (set per transaction). Read Committed = PG default.
BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT balance FROM demo_accounts WHERE id = 1;  -- snapshot fixed for this txn
COMMIT;
-- SERIALIZABLE gives full isolation but may abort with a serialization error
-- (retry the transaction). READ COMMITTED sees others' committed changes between
-- statements (non-repeatable reads possible).

-- LOCKING: SELECT ... FOR UPDATE locks rows so another txn can't change them.
BEGIN;
  SELECT * FROM demo_accounts WHERE id = 1 FOR UPDATE;  -- row locked until commit
  UPDATE demo_accounts SET balance = balance + 5 WHERE id = 1;
COMMIT;

-- Queue pattern: claim a job without blocking on locked rows.
CREATE TABLE demo_jobs (id INT PRIMARY KEY, status TEXT DEFAULT 'pending');
INSERT INTO demo_jobs (id) VALUES (1),(2),(3);
BEGIN;
  -- Two workers running this concurrently each grab DIFFERENT rows (no waiting).
  SELECT * FROM demo_jobs WHERE status='pending'
  ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1;
COMMIT;
-- Deadlock: txn A locks row1 then row2 while B locks row2 then row1 -> Postgres
-- detects it and aborts one. Avoid by locking rows in a consistent order.

DROP TABLE demo_accounts, demo_jobs CASCADE;
