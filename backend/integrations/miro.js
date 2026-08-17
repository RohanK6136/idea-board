module.exports = {
  async import(user, opts) {
    // stub: implement Miro OAuth and board import mapping
    return { ok: true, provider: 'miro', message: 'Import scaffolded' };
  },
  async export(user, opts) {
    return { ok: true, provider: 'miro', message: 'Export scaffolded' };
  }
};
