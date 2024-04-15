const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const base64 = require('base-64');
const fs = require('fs');
const admZip = require('adm-zip');
const os = require('os');
const path = require('path');


const LegiScan = require('./LegiScan');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const apiKey = process.env.API_KEY;
const legiScan = new LegiScan(apiKey);

const db = new sqlite3.Database('../layman.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
          if (err) {
              reject(err);
          } else {
              resolve(this);
          }
      });
  });
}

function retrieveRow(sql, params = []) {
  return new Promise((resolve, reject) => {
      db.get(sql, params, function (err, row) {
          if (err) {
              reject(err);
          } else {
              resolve(row);
          }
      });
  });
}

runSql(`
CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

runSql(`
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

runSql(`
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER,
  label TEXT,
  json TEXT
);`);

runSql(`
CREATE TABLE IF NOT EXISTS config (
  name TEXT,
  value TEXT
)
`)

let lastUpdatedDate;

app.get('/getSessionList/state/:state', async (req, res) => {
  try {
    const sessionList = await legiScan.getSessionList(req.params.state);
    res.status(200).send(sessionList);
  } catch (error) {
    console.error('Server.legiScan:err Error fetching data:', error);
    res.status(500).send('Failed to fetch data');
  }
});

async function pullExtractZip(extractionDir) {
  try {
    const datasetList = await legiScan.getDataSetList('UT','2024');
    const dataset = datasetList.datasetlist.filter(item => item.session_title === "2024 Regular Session");
    const accessKey = dataset[0].access_key;
    const session_id = dataset[0].session_id;
    const jsonData = await legiScan.getDataSet(session_id, accessKey);

    // Decode base64-encoded dataset.zip content
    const datasetZipBuffer = Buffer.from(jsonData.dataset.zip, 'base64');

    // Create a directory to extract the zip contents (optional)
    // const extractionDir = os.tmpdir() + "/extracted";
    console.log(`Writing files to ${extractionDir}`)
    if (!fs.existsSync(extractionDir)) {
      fs.mkdirSync(extractionDir);
    }

    // Use adm-zip to extract the zip file content
    const zip = new admZip(datasetZipBuffer);
    zip.extractAllTo(extractionDir, /*overwrite*/ true);
  } catch (err) {
    throw new Error("pullZip: error ", err);
  }
}

async function purgeTable(tableName) {
  try {
    const result = await runSql(`DELETE FROM ${tableName};`);
    console.log(`Purged ${result.changes} records from ${tableName} table`);
  } catch (err) {
    throw new Error('Failed to purge table', err);
  }
}

async function insertRow(tableName, label, json) {
  try {
    const sql = `INSERT INTO ${tableName} (year,label,json) VALUES (?,?,?)`;
    const result = await runSql(sql, ['2024', label, json]);
    return result;
    // console.log(`insert result`, result)
  } catch (err) {
    throw new Error('Failed to insert row', err);
  }
}

async function readDir(folderName) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderName, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

async function readFile(filePath) {
  try {
    // Read file asynchronously
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    return data;
  } catch (err) {
    // An error occurred while reading the file, throw the error
    throw err;
  }
}

async function insertRows(folderName, filesList, tableName) {
  try {
    // Iterate over each file in the list
    let rowCount = 0;
    for (let file of filesList) {
      const filePath = path.join(folderName, file);
      const data = await readFile(filePath);

      // Process data and insert row
      const label = file.substring(0, file.indexOf('.'));
      //const json = JSON.parse(data);
      const result = await insertRow(tableName, label, data);
      if (result.changes>0) rowCount++;
    }
    console.log(`Inserted ${rowCount} rows into the ${tableName}`);
    return rowCount;
  } catch (err) {
    console.error('Error inserting records:', err);
    throw err; // Propagate error to caller
  }
}

async function populateTable(folderName, tableName) {
  try {

    await purgeTable(tableName);

    const files = await readDir(folderName);
    const rows = await insertRows(folderName, files, tableName);
  } catch (err) {
    debugger;
    throw new Error('populatTable:err ', err);
  }
}

app.get('/refreshData', async (req, res) => {
  try {

    const extractionDir = "../extracted";
    await pullExtractZip(extractionDir);

    await populateTable(extractionDir + "/UT/2024-2024_General_Session/bill", 'bills');
    await populateTable(extractionDir + "/UT/2024-2024_General_Session/people", 'people');
    await populateTable(extractionDir + "/UT/2024-2024_General_Session/vote", 'votes');

    const lastUpdatedDateRecord = await retrieveRow("SELECT value FROM config WHERE name='last_updated_date'");
    if (lastUpdatedDateRecord) runSql("UPDATE config SET value = datetime('now', 'localtime') WHERE name = 'last_updated_date'");
    else runSql("INSERT INTO config (name,value) VALUES (?,datetime('now','localtime'))",['last_updated_date']);
    lastUpdatedDate = lastUpdatedDateRecord.value;

    res.json({ message: lastUpdatedDate });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({message: 'Failed to fetch data', error: error.message});
  }
});

app.get('/last-updated', async (req,res) => {
  try {
    if (lastUpdatedDate) {
      res.json({message:lastUpdatedDate});
      return;
    }
    const lastUpdatedDateRecord = await retrieveRow("SELECT value FROM config WHERE name='last_updated_date'");
    if (lastUpdatedDateRecord) {
      lastUpdatedDate = lastUpdatedDateRecord.value;
      res.json({message:lastUpdatedDate});
    } else {
      res.json({message:'Never'});
    }
  } catch (error) {
    console.error('Error occurred', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/extract-zip', async (req, res) => {
  try {
    const { dataset } = req.body;


  } catch (error) {
    console.error('Error occurred', error);
    res.status(500).send('Internal server error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
