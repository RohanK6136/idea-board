module.exports = {
  async import(user, opts) { return { ok: true, provider: 'goodday', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'goodday', message: 'Export scaffolded' }; }
};
