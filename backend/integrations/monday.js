module.exports = {
  async import(user, opts) { return { ok: true, provider: 'monday', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'monday', message: 'Export scaffolded' }; }
};
