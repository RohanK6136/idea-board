const asana = require('./asana');
const monday = require('./monday');
const clickup = require('./clickup');
const jira = require('./jira');
const goodday = require('./goodday');
const wrike = require('./wrike');
const hive = require('./hive');

const wekan = require('./wekan');
const planka = require('./planka');
const vikunja = require('./vikunja');
const taiga = require('./taiga');
const plane = require('./plane');
const openproject = require('./openproject');
const kanboard = require('./kanboard');
const focalboard = require('./focalboard');

function register(app, authenticate) {
  const integrations = { asana, monday, clickup, jira, goodday, wrike, hive };
  Object.keys(integrations).forEach(key => {
    app.post(`/api/integrations/${key}/import`, authenticate, async (req, res) => {
      try {
        const result = await integrations[key].import(req.user, req.body || {});
        res.json(result);
      } catch (err) {
        console.error(`Import ${key} failed`, err);
        res.status(500).json({ error: err.message });
      }
    });

    app.post(`/api/integrations/${key}/export`, authenticate, async (req, res) => {
      try {
        const result = await integrations[key].export(req.user, req.body || {});
        res.json(result);
      } catch (err) {
        console.error(`Export ${key} failed`, err);
        res.status(500).json({ error: err.message });
      }
    });
  });

  // open-source connectors (read-only import endpoints)
  const oss = { wekan, planka, vikunja, taiga, plane, openproject, kanboard, focalboard };
  Object.keys(oss).forEach(key => {
    app.post(`/api/integrations/${key}/import`, authenticate, async (req, res) => {
      try {
        const result = await oss[key].import(req.user, req.body || {});
        res.json(result);
      } catch (err) {
        console.error(`Import ${key} failed`, err);
        res.status(500).json({ error: err.message });
      }
    });
  });
}

module.exports = { register };
