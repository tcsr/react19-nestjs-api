-- ============================================================================
-- 07 — UPSERT (INSERT ... ON CONFLICT) & RETURNING
-- Upsert = insert or update-on-duplicate atomically. RETURNING gives back the
-- affected rows (great for getting generated ids without a second query).
-- ============================================================================
DROP TABLE IF EXISTS demo_inventory CASCADE;
CREATE TABLE demo_inventory (
  sku TEXT PRIMARY KEY,
  qty INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INSERT ... RETURNING (get the row back).
INSERT INTO demo_inventory (sku, qty) VALUES ('A', 10) RETURNING *;

-- UPSERT: on PK conflict, ADD to existing qty (EXCLUDED = the proposed row).
INSERT INTO demo_inventory (sku, qty) VALUES ('A', 5)
ON CONFLICT (sku) DO UPDATE
  SET qty = demo_inventory.qty + EXCLUDED.qty,
      updated_at = now()
RETURNING sku, qty;   -- A now 15

-- ON CONFLICT DO NOTHING: ignore duplicates silently.
INSERT INTO demo_inventory (sku, qty) VALUES ('A', 99)
ON CONFLICT (sku) DO NOTHING;

-- UPDATE ... RETURNING and DELETE ... RETURNING also work.
UPDATE demo_inventory SET qty = qty - 3 WHERE sku = 'A' RETURNING sku, qty; -- 12

SELECT * FROM demo_inventory;

DROP TABLE demo_inventory CASCADE;
