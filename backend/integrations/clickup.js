module.exports = {
  async import(user, opts) { return { ok: true, provider: 'clickup', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'clickup', message: 'Export scaffolded' }; }
};
