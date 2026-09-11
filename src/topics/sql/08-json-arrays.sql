-- ============================================================================
-- 08 — JSONB & ARRAYS
-- Postgres has first-class JSONB (binary, indexable) and array types. Prefer JSONB
-- over JSON. GIN indexes make containment/key queries fast.
-- ============================================================================
DROP TABLE IF EXISTS demo_products CASCADE;
CREATE TABLE demo_products (
  id INT PRIMARY KEY,
  name TEXT,
  tags TEXT[],            -- array column
  attrs JSONB             -- flexible attributes
);
INSERT INTO demo_products VALUES
 (1,'Pen',   ARRAY['office','blue'], '{"price":2,"stock":100,"meta":{"color":"blue"}}'),
 (2,'Laptop',ARRAY['tech'],          '{"price":999,"stock":5,"meta":{"color":"gray"}}');

-- JSONB access: -> returns JSON, ->> returns text; #>> for deep path.
SELECT name,
  attrs->>'price'          AS price_text,
  (attrs->>'price')::numeric AS price_num,
  attrs#>>'{meta,color}'   AS color
FROM demo_products;

-- Containment @> and key existence ? (needs GIN index at scale).
SELECT name FROM demo_products WHERE attrs @> '{"meta":{"color":"blue"}}';
SELECT name FROM demo_products WHERE attrs ? 'stock';

-- Update a JSONB field with jsonb_set.
UPDATE demo_products SET attrs = jsonb_set(attrs, '{stock}', '90') WHERE id = 1
RETURNING name, attrs->>'stock';

-- ARRAY operators: contains @>, overlap &&, ANY, unnest.
SELECT name FROM demo_products WHERE tags @> ARRAY['tech'];        -- has 'tech'
SELECT name FROM demo_products WHERE 'blue' = ANY(tags);           -- membership
SELECT name, unnest(tags) AS tag FROM demo_products;              -- expand to rows

-- GIN index for JSONB containment / array ops (query planner uses it at scale).
CREATE INDEX idx_products_attrs ON demo_products USING GIN (attrs);
CREATE INDEX idx_products_tags  ON demo_products USING GIN (tags);

DROP TABLE demo_products CASCADE;
