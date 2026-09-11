-- ============================================================================
-- 12 — FUNCTIONS & TRIGGERS (PL/pgSQL)
-- Functions encapsulate logic in the DB; triggers run a function automatically on
-- INSERT/UPDATE/DELETE. Common uses: audit logs, derived columns, updated_at,
-- enforcing complex invariants close to the data.
-- ============================================================================
DROP TABLE IF EXISTS demo_audit, demo_items CASCADE;
DROP FUNCTION IF EXISTS touch_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_change() CASCADE;

CREATE TABLE demo_items (
  id INT PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE demo_audit (
  id SERIAL PRIMARY KEY,
  item_id INT, action TEXT, at TIMESTAMPTZ DEFAULT now()
);

-- Plain function: compute something.
CREATE FUNCTION price_with_tax(p NUMERIC, rate NUMERIC DEFAULT 0.1)
RETURNS NUMERIC LANGUAGE sql AS $$
  SELECT round(p * (1 + rate), 2);
$$;
SELECT price_with_tax(100);       -- 110.00
SELECT price_with_tax(100, 0.2);  -- 120.00

-- Trigger function 1: keep updated_at fresh on UPDATE.
CREATE FUNCTION touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_touch BEFORE UPDATE ON demo_items
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Trigger function 2: write an audit row on any change.
CREATE FUNCTION log_change() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO demo_audit(item_id, action) VALUES (COALESCE(NEW.id, OLD.id), TG_OP);
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON demo_items
FOR EACH ROW EXECUTE FUNCTION log_change();

-- Exercise the triggers.
INSERT INTO demo_items (id, name, price) VALUES (1,'Pen',2);
UPDATE demo_items SET price = 3 WHERE id = 1;
DELETE FROM demo_items WHERE id = 1;

SELECT action, count(*) FROM demo_audit GROUP BY action;  -- INSERT/UPDATE/DELETE each 1

DROP TABLE demo_audit, demo_items CASCADE;
DROP FUNCTION touch_updated_at() CASCADE;
DROP FUNCTION log_change() CASCADE;
DROP FUNCTION price_with_tax(NUMERIC, NUMERIC);
