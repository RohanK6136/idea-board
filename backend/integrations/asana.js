module.exports = {
  async import(user, opts) {
    // stub: implement Asana OAuth or PAT flow and mapping
    return { ok: true, provider: 'asana', message: 'Import scaffolded' };
  },
  async export(user, opts) {
    return { ok: true, provider: 'asana', message: 'Export scaffolded' };
  }
};
