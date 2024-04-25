// IMPORT REQUIRED PACKAGES
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const fs = require('fs');
const admZip = require('adm-zip');
const path = require('path');
const LegiScan = require('./LegiScan'); // Import the LegiScan module from a local file.

// INITIALIZE VARIABLES
dotenv.config(); // Load environment variables from a .env file.
const app = express(); // Initialize an Express application.
app.use(cors()); // Enable CORS for all routes to allow cross-origin requests.
app.use(express.json()); // Use middleware to parse JSON-formatted request bodies.
const apiKey = process.env.LEGISCAN_API_KEY; // Retrieve the API key from environment variables.
const legiScan = new LegiScan(apiKey); // Create a new instance of LegiScan configured with the API key.
let lastUpdatedDate;  // Variable to hold the last updated date.

//-------------------------------------------------------------//
//-----------------------SET UP DATABASE-----------------------//
//-------------------------------------------------------------//

// CONNECT TO DATABASE
const db = new sqlite3.Database('../layman.db', (err) => {
  if (err) return console.error(err.message); // Log error if connection fails
  console.log('Connected to the SQlite database.'); // Confirm successful connection
});

// CREATE FUNCTION TO EXECUTE SQL (using promises for better async handling)
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); // Reject the promise if there is an error
      else resolve(this); // Otherwise, resolve the promise with the context
    });
  });
}

// CREATE TABLES (if they do not exist)
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
);`);

// CREATE FUNCTION TO RETRIEVE A SINGLE ROW FROM THE DATABASE
function retrieveRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) reject(err); // Reject the promise if there is an error
      else resolve(row); // Otherwise, resolve the promise with the retrieved row
    });
  });
}

// CREATE FUNCTION TO RETRIEVE MULTIPLE ROWS
function retrieveRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) reject(err); // Reject the promise if there is an error
      else resolve(rows); // Otherwise, resolve the promise with the retrieved rows
    });
  });
}

// CREATE FUNCTION TO INSERT A ROW
async function insertRow(tableName, label, json) {
  try {
    const sql = `INSERT INTO ${tableName} (year,label,json) VALUES (?,?,?)`; // SQL command to insert a row.
    const result = await runSql(sql, ['2024', label, json]); // Execute SQL command with values.
    return result; // Return the result object.
  } catch (err) {
    debugger;
    throw new Error('Failed to insert row', err); // Throw error if insertion fails.
  }
}

// CREATE FUNCTION TO PURGE TABLE
async function purgeTable(tableName) {
  try {
    const result = await runSql(`DELETE FROM ${tableName};`); // Execute SQL command to delete all records.
    console.log(`Purged ${result.changes} records from ${tableName} table`); // Log the number of records deleted.
  } catch (err) {
    debugger;
    throw new Error('Failed to purge table', err); // Throw error if purging fails.
  }
}

//---------------------------------------------------------------------//
//-----------------------RETRIEVAL FROM LEGISCAN-----------------------//
//---------------------------------------------------------------------//

// Function to extract ZIP file contents to a specified directory.
async function pullExtractZip(extractionDir) {
  try {
    const datasetList = await legiScan.getDataSetList('UT','2024'); // Fetch dataset list for Utah 2024.
    const dataset = datasetList.datasetlist.filter(item => item.session_title === "2024 Regular Session"); // Filter for the 2024 Regular Session.
    const accessKey = dataset[0].access_key; // Get access key from the dataset.
    const session_id = dataset[0].session_id; // Get session ID from the dataset.
    const jsonData = await legiScan.getDataSet(session_id, accessKey); // Fetch the dataset using session ID and access key.

    const datasetZipBuffer = Buffer.from(jsonData.dataset.zip, 'base64'); // Decode base64-encoded ZIP file content.
    console.log(`Writing files to ${extractionDir}`) // Log the directory where files will be written.
    if (!fs.existsSync(extractionDir)) {
      fs.mkdirSync(extractionDir); // Create the directory if it does not exist.
    }

    const zip = new admZip(datasetZipBuffer); // Create a ZIP object for extraction.
    zip.extractAllTo(extractionDir, /*overwrite*/ true); // Extract all contents to the directory, overwriting existing files.
  } catch (err) {
    debugger;
    throw new Error("pullZip: error ", err); // Throw error if extraction fails.
  }
}

//---------------------------------------------------------------------//
//--------------------------HELPER FUNCTIONS---------------------------//
//---------------------------------------------------------------------//

// Asynchronous function to read directory contents and return a promise of file names.
async function readDir(folderName) {
    return new Promise((resolve, reject) => {
      fs.readdir(folderName, (err, files) => {
        if (err) reject(err); // If an error occurs, reject the promise.
        else resolve(files); // Otherwise, resolve the promise with the list of files.
      });
    });
  }
  
// Asynchronous function to read a file and return its content.
async function readFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' }); // Read file asynchronously with UTF-8 encoding.
    return data;
  } catch (err) {
    debugger;
    throw err; // If an error occurs, throw the error.
  }
}

// Asynchronous function to process files and insert data into a specified database table.
async function insertRows(folderName, filesList, tableName) {
  try {
    let rowCount = 0; // Initialize counter for rows inserted.
    for (let file of filesList) { // Iterate over each file in the provided list.
      const filePath = path.join(folderName, file); // Generate full path for the file.
      const data = await readFile(filePath); // Read the content of the file.

      const label = file.substring(0, file.indexOf('.')); // Extract label from file name (before the first dot).
      const result = await insertRow(tableName, label, data); // Insert data into the table.
      if (result.changes > 0) rowCount++; // Increment counter if rows were added.
    }
    console.log(`Inserted ${rowCount} rows into the ${tableName}`); // Log the number of rows inserted.
    return rowCount;
  } catch (err) {
    debugger;
    console.error('Error inserting records:', err); // Log error if insertion fails.
    throw err; // Propagate error to caller.
  }
}

// Asynchronous function to refresh and populate a specified table from a directory.
async function populateTable(folderName, tableName) {
  try {
    await purgeTable(tableName); // Delete all records from the table.

    const files = await readDir(folderName); // Read all files from the specified folder.
    const rows = await insertRows(folderName, files, tableName); // Insert all read files into the database table.
  } catch (err) {
    debugger; // Debugger statement for error handling.
    throw new Error('populateTable:err ', err); // Throw error with custom message.
  }
}

//-----------------------------------------------------------//
//-----------------------API ENDPOINTS-----------------------//
//-----------------------------------------------------------//

// (GET) REFRESH DATA
app.get('/refreshData', async (req, res) => {
  try {
    const extractionDir = "../extracted"; // Define directory for extracted data.
    await pullExtractZip(extractionDir); // Extract new data.

    // Populate database tables with new data.
    await populateTable(extractionDir + "/UT/2024-2024_General_Session/bill", 'bills');
    await populateTable(extractionDir + "/UT/2024-2024_General_Session/people", 'people');
    await populateTable(extractionDir + "/UT/2024-2024_General_Session/vote", 'votes');

// See if last_updated_date in the config table already exists
let lastUpdatedDateRecord = await retrieveRow("SELECT value FROM config WHERE name='last_updated_date'");

// If it does, update the existing record.
if (lastUpdatedDateRecord) { 
  await runSql("UPDATE config SET value = datetime('now', 'localtime') WHERE name = 'last_updated_date'");
} 
// If not, insert a new record and assign it to the lastUpdatedDateRecord.
else { 
  await runSql("INSERT INTO config (name, value) VALUES ('last_updated_date', datetime('now', 'localtime'))");
  lastUpdatedDateRecord = await retrieveRow("SELECT value FROM config WHERE name='last_updated_date'");
}

// Update lastUpdatedDate variable with the current value from the database.
const lastUpdatedDate = lastUpdatedDateRecord.value;

    res.json({ message: lastUpdatedDate }); // Send updated date as response.
  } catch (error) {
    console.error('Error fetching data:', error); // Log fetching error.
    res.status(500).json({message: 'Failed to fetch data', error: error.message}); // Send error response.
  }
});

// GET LAST UPDATED
app.get('/last-updated', async (req, res) => {
  try {
    if (lastUpdatedDate) {
      res.json({message: lastUpdatedDate}); // Send last updated date if available.
      return;
    }
    const lastUpdatedDateRecord = await retrieveRow("SELECT value FROM config WHERE name='last_updated_date'");
    if (lastUpdatedDateRecord) {
      lastUpdatedDate = lastUpdatedDateRecord.value; // Update variable with last updated date from database.
      res.json({message: lastUpdatedDate}); // Send last updated date as response.
    } else {
      res.json({message:'Never'}); // Send 'Never' if no date is found.
    }
  } catch (error) {
    console.error('Error occurred', error); // Log error.
    res.status(500).send('Internal server error'); // Send error response.
  }
});

// GET BILLS BY STATUS
/**
 * Handles GET requests to fetch bills by their status name. This endpoint converts a human-readable status name 
 * into a numeric status code based on a predefined mapping and queries the database for bills matching this status.
 * It returns the bills with the title, description, and the URL of the PDF from the last text entry sorted by date.
 * 
 * @param {Object} req - The request object containing route parameters.
 * @param {string} req.params.status - The status name of the bills to fetch. Should be one of the following:
 *                                     'introduced', 'in_discussion', 'submitted', 'passed', 'vetoed', 'failed'.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @route GET /getBillsByStatus/:status
 * @returns {void} Returns nothing. Responses are handled by sending JSON data with the fetched bills or 
 *                 an error message in case of failure or invalid input.
 * @throws {400} - If the status name provided does not match any key in the status map, it sends a 400 Bad Request response.
 * @throws {500} - If there is any error during database query execution or another unexpected issue, it sends a 500 Internal Server Error response.
 */
app.get('/getBillsByStatus/:status', async (req, res) => {
  try {
    // Map of status names to their corresponding numbers
    const statusMap = {
      'introduced': 1,
      'in_discussion': 2,
      'submitted': 3,
      'passed': 4,
      'vetoed': 5,
      'failed': 6
    };

    // Get status name from the URL parameter and convert to corresponding number
    const statusName = req.params.status.toLowerCase(); // Convert to lower case to ensure case insensitivity
    const statusCode = statusMap[statusName];

    // Check if the status code exists, if not, send an error response
    if (!statusCode) {
      return res.status(400).send({ error: "Invalid status name provided." });
    }

    // SQL query to select bills based on status code
    const sqlQuery = `
      SELECT
        json_extract(json, '$.bill.title') AS name,
        json_extract(
          json, 
          '$.bill.texts[' || (json_array_length(json_extract(json, '$.bill.texts')) - 1) || '].state_link'
        ) AS pdf_url
      FROM bills
      WHERE json_extract(json, '$.bill.status') = ?;
    `;

    // Execute the query using the statusCode
    const rows = await retrieveRows(sqlQuery, [statusCode]);

    // Send the results as JSON
    res.json(rows);
  } catch (error) {
    console.error("Error fetching bills by status:", error);
    res.status(500).json({ error: "An error occurred while fetching the data." });
  }
});

// Endpoint to fetch a session list from LegiScan for a specific state.
// app.get('/getSessionList/state/:state', async (req, res) => {
//   try {
//     const sessionList = await legiScan.getSessionList(req.params.state); // Fetch session list using the LegiScan API.
//     res.status(200).send(sessionList); // Send successful response with the session list.
//   } catch (error) {
//     console.error('Server.legiScan:err Error fetching data:', error); // Log error if the fetch fails.
//     res.status(500).send('Failed to fetch data'); // Send error response if the fetch fails.
//   }
// });

// Endpoint to handle a POST request to extract data from a zip file provided in the request.
app.post('/extract-zip', async (req, res) => {
  try {
    const { dataset } = req.body; // Extract dataset from request body.
  } catch (error) {
    console.error('Error occurred', error); // Log error.
    res.status(500).send('Internal server error'); // Send error response.
  }
});

//---------------------------------------------------------//
//-----------------------SET UP PORT-----------------------// *Don't move this section. Must be at the end.
//---------------------------------------------------------//
  
  const PORT = process.env.PORT || 3001; // Define the port on which the server will listen.
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Log the port on which the server is running.
  });  