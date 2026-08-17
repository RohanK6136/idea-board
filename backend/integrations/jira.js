module.exports = {
  async import(user, opts) { return { ok: true, provider: 'jira', message: 'Import scaffolded' }; },
  async export(user, opts) { return { ok: true, provider: 'jira', message: 'Export scaffolded' }; }
};
