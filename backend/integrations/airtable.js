const Airtable = require('airtable');

function getBase(apiKey, baseId) {
  Airtable.configure({ apiKey });
  return Airtable.base(baseId);
}

async function selectAll(base, tableName, selectOptions) {
  const out = [];
  return new Promise((resolve, reject) => {
    base(tableName)
      .select(selectOptions || {})
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((r) => out.push({ id: r.id, fields: r.fields }));
          fetchNextPage();
        },
        (err) => (err ? reject(err) : resolve(out))
      );
  });
}

async function createBatches(base, tableName, records) {
  const created = [];
  const batchSize = 10;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map((r) => ({ fields: r }));
    // Airtable callback style
    // Wrap in promise
    /* eslint-disable no-await-in-loop */
    const res = await new Promise((resolve, reject) => {
      base(tableName).create(batch, (err, recs) => {
        if (err) return reject(err);
        resolve(recs.map((rr) => ({ id: rr.id, fields: rr.fields })));
      });
    });
    created.push(...res);
  }
  return created;
}

module.exports = {
  /**
   * Import records from an Airtable table and map to internal card format.
   * opts: { apiKey, baseId, table }
   */
  async import(user, opts = {}) {
    const apiKey = opts.apiKey || process.env.AIRTABLE_API_KEY;
    const baseId = opts.baseId || process.env.AIRTABLE_BASE_ID;
    const table = opts.table || 'Boards';
    if (!apiKey || !baseId) return { ok: false, error: 'Missing Airtable credentials' };
    try {
      const base = getBase(apiKey, baseId);
      const rows = await selectAll(base, table, opts.select);
      // Map Airtable fields to a generic card/board shape
      const mapped = rows.map((r) => ({
        id: r.id,
        title: r.fields.Name || r.fields.title || r.fields.Title || 'Untitled',
        description: r.fields.Description || r.fields.description || '',
        status: r.fields.Status || r.fields.status || null,
        assignee: r.fields.Assignee || r.fields.assignee || null,
        due: r.fields.Due || r.fields.due || null,
        raw: r.fields
      }));
      return { ok: true, provider: 'airtable', table, count: mapped.length, records: mapped };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },

  /**
   * Export generic records into an Airtable table. Accepts records array of field objects.
   * opts: { apiKey, baseId, table, records }
   */
  async export(user, opts = {}) {
    const apiKey = opts.apiKey || process.env.AIRTABLE_API_KEY;
    const baseId = opts.baseId || process.env.AIRTABLE_BASE_ID;
    const table = opts.table || 'Boards';
    const records = opts.records || [];
    if (!apiKey || !baseId) return { ok: false, error: 'Missing Airtable credentials' };
    if (!Array.isArray(records) || records.length === 0) return { ok: false, error: 'No records to export' };
    try {
      const base = getBase(apiKey, baseId);
      // Convert each record to fields object if needed
      const normalized = records.map((r) => (r.fields ? r.fields : r));
      const created = await createBatches(base, table, normalized);
      return { ok: true, provider: 'airtable', createdCount: created.length, created };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
};
