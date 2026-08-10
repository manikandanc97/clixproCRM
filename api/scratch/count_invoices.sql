SELECT 
  "tenantId",
  COUNT(*) as invoice_count,
  MIN("createdAt") as earliest,
  MAX("createdAt") as latest
FROM "Invoice"
GROUP BY "tenantId"
ORDER BY "tenantId";
