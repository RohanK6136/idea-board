module.exports = {
  async import(user, opts) { return { ok: true, provider: 'wrike', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'wrike', message: 'Export scaffolded' }; }
};
