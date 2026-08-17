module.exports = {
  async import(user, opts) { return { ok: true, provider: 'hive', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'hive', message: 'Export scaffolded' }; }
};
