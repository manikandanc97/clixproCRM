async function withCrmDataSource(scope, loader) {
  const startTime = Date.now();
  try {
    const data = await loader();
    const duration = Date.now() - startTime;
    console.log(`[CRM SOURCE] Scope: ${scope} | Status: SUCCESS | Duration: ${duration}ms`);
    return {
      source: "database",
      ...data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CRM SOURCE ERROR] Scope: ${scope} | Duration: ${duration}ms | Error:`, error.message || error);
    throw error;
  }
}

module.exports = {
  withCrmDataSource,
};
