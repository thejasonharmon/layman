const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const unzipper = require('unzipper');
const { promisify } = require('util');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./layman.db', (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Connected to the SQLite database.');
});

// Create tables if they do not exist
const createTableQueries = [
  `CREATE TABLE IF NOT EXISTS bill (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER, label TEXT, json TEXT);`,
  `CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER, label TEXT, json TEXT);`,
  `CREATE TABLE IF NOT EXISTS vote (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER, label TEXT, json TEXT);`
];
createTableQueries.forEach(query => db.run(query));

const dbRun = promisify(db.run.bind(db));

async function insertIntoTable(tableName, jsonData) {
  // Check if tableName is valid to prevent SQL injection
  if (!['bill', 'people', 'vote'].includes(tableName)) {
    console.error(`Error: Invalid table name '${tableName}'`);
    return; // Exit if table name is not valid
  }

  // Construct the SQL insert statement
  const sql = `INSERT INTO ${tableName} (json) VALUES (?)`;
  const values = [JSON.stringify(jsonData)]; // Ensure the data is a string in JSON format

  // Execute the SQL statement
  try {
    const dbRun = promisify(db.run.bind(db));
    await dbRun(sql, values);
    console.log(`Data inserted successfully into ${tableName}.`);
  } catch (err) {
    console.error(`Error inserting data into ${tableName}:`, err);
  }
}

app.post('/populateData', async (req, res) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&access_key=${process.env.ACCESS_KEY}&id=${process.env.SESSION_ID}&op=getDataSet`,
      responseType: 'json'
    });

    if (response.data.status === 'OK' && response.data.dataset.zip) {
      const zipData = Buffer.from(response.data.dataset.zip, 'base64');
      const directory = await unzipper.Open.buffer(zipData);
      const processingPromises = [];
      const fileRegex = /^UT\/2024-2024_General_Session\/(bill|people|vote)\/.+.json$/;

      for (const entry of directory.files) {
        if (fileRegex.test(entry.path)) {
          processingPromises.push(entry.buffer().then(content => {
            const tableName = entry.path.split('/')[2];
            const json = JSON.parse(content.toString());
            return insertIntoTable(tableName, json);
          }).catch(err => {
            console.error(`Failed to process file ${entry.path}:`, err);
          }));
        }
      }

      await Promise.all(processingPromises);
      res.status(200).json({ message: 'Data populated successfully' });
    } else {
      throw new Error('Invalid dataset response from API');
    }
  } catch (error) {
    console.error('Failed to fetch or process data', error);
    res.status(500).json({ message: 'Failed to process data', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
