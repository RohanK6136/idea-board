module.exports = {
  async import(user, opts) {
    // stub: implement Airtable API integration and table-to-board mapping
    return { ok: true, provider: 'airtable', message: 'Import scaffolded' };
  },
  async export(user, opts) {
    return { ok: true, provider: 'airtable', message: 'Export scaffolded' };
  }
};
