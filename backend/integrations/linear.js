module.exports = {
  async import(user, opts) {
    // stub: implement Linear API integration and issue import
    return { ok: true, provider: 'linear', message: 'Import scaffolded' };
  },
  async export(user, opts) {
    return { ok: true, provider: 'linear', message: 'Export scaffolded' };
  }
};
