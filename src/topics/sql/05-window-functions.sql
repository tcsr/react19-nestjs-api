-- ============================================================================
-- 05 — WINDOW FUNCTIONS
-- Compute across a set of rows RELATED to the current row WITHOUT collapsing them
-- (unlike GROUP BY). OVER(PARTITION BY ... ORDER BY ...) defines the window.
-- ============================================================================
DROP TABLE IF EXISTS demo_scores CASCADE;
CREATE TABLE demo_scores (player TEXT, game TEXT, score INT);
INSERT INTO demo_scores VALUES
 ('Ada','g1',10),('Ada','g2',30),('Alan','g1',20),('Alan','g2',25),('Grace','g1',20);

-- Ranking: ROW_NUMBER (unique), RANK (gaps on ties), DENSE_RANK (no gaps).
SELECT player, game, score,
  ROW_NUMBER() OVER (ORDER BY score DESC) AS rownum,
  RANK()       OVER (ORDER BY score DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense
FROM demo_scores;

-- PARTITION: rank within each game.
SELECT player, game, score,
  RANK() OVER (PARTITION BY game ORDER BY score DESC) AS rank_in_game
FROM demo_scores;

-- LAG / LEAD: previous / next row's value (per player, ordered by game).
SELECT player, game, score,
  LAG(score)  OVER (PARTITION BY player ORDER BY game) AS prev,
  LEAD(score) OVER (PARTITION BY player ORDER BY game) AS next
FROM demo_scores;

-- Running total + moving frame (ROWS BETWEEN).
SELECT player, game, score,
  SUM(score) OVER (PARTITION BY player ORDER BY game
                   ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
  AVG(score) OVER (ORDER BY score ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg
FROM demo_scores;

-- NTILE (buckets) + FIRST_VALUE.
SELECT player, score,
  NTILE(2) OVER (ORDER BY score DESC) AS half,
  FIRST_VALUE(player) OVER (ORDER BY score DESC) AS top_player
FROM demo_scores;

DROP TABLE demo_scores CASCADE;
