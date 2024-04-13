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

// Initialize DB with tables if they don't exist
// db.run(`CREATE TABLE IF NOT EXISTS sessions (
//   state_id INTEGER,
//   session_id INTEGER PRIMARY KEY,
//   year_start INTEGER,
//   year_end INTEGER,
//   prefile INTEGER,
//   sine_die INTEGER,
//   prior INTEGER,
//   special INTEGER,
//   session_tag TEXT,
//   session_title TEXT,
//   session_name TEXT,
//   dataset_date TEXT,
//   dataset_hash TEXT,
//   dataset_size INTEGER,
//   access_key TEXT
// )`);

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
