-- Corrige premios creados con el bug de Math.floor: fee_amount = 0 y prize_net = amount_total.
-- Recalcula fee_amount y prize_net con lógica Stellar (stroops = amount * 1e7, fee = total_stroops * fee_bps / 10000).
WITH wrong AS (
  SELECT
    id,
    FLOOR(CAST(amount_total AS numeric) * 10000000)::bigint AS total_stroops,
    (FLOOR(CAST(amount_total AS numeric) * 10000000)::bigint * fee_bps / 10000) AS fee_stroops
  FROM prizes
  WHERE fee_bps > 0
    AND (fee_amount = '0' OR fee_amount = '0.0000000' OR prize_net = amount_total)
)
UPDATE prizes p
SET
  fee_amount = (w.fee_stroops / 10000000.0)::numeric(20,7),
  prize_net  = ((w.total_stroops - w.fee_stroops) / 10000000.0)::numeric(20,7)
FROM wrong w
WHERE p.id = w.id;
