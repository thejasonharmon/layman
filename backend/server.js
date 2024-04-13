const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./layman.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

db.run(`
CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

db.run(`
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

db.run(`
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

app.get('/refreshData', async (req, res) => {
  try {
    const response = await axios.get(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getDatasetList`);
    const datasets = response.data.datasetlist;

    datasets.forEach(dataset => {
      db.run(`REPLACE INTO sessions (state_id, session_id, year_start, year_end, prefile, sine_die, prior, special, session_tag, session_title, session_name, dataset_date, dataset_hash, dataset_size, access_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dataset.state_id, dataset.session_id, dataset.year_start, dataset.year_end, dataset.prefile, dataset.sine_die, dataset.prior, dataset.special, dataset.session_tag, dataset.session_title, dataset.session_name, dataset.dataset_date, dataset.dataset_hash, dataset.dataset_size, dataset.access_key]);
    });

    res.json({ message: 'Data refreshed successfully' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Failed to fetch data');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
