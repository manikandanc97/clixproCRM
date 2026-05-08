async function withCrmDataSource(scope, loader) {
  return {
    source: "database",
    ...(await loader()),
  };
}

module.exports = {
  withCrmDataSource,
};
