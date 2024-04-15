const axios = require('axios');

class LegiScan {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.legiscan.com/';
    }

    async getMasterList(state) {
        const apiPrefix = `${this.baseUrl}?key=${this.apiKey}&op=getMasterList&state=${state}`;
        try {
            const response = await axios.get(apiPrefix);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const jsonData = await response.json();
            console.log(jsonData); // Log the JSON data
            return jsonData;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    async getSessionList(state) {
        const apiPrefix = `${this.baseUrl}?key=${this.apiKey}&op=getSessionList&state=${state}`;
        try {
            const response = await axios.get(apiPrefix);
            if (response.status != 200) {
                throw new Error(`Network response was not 200: ${response.status}`);
            }
            const jsonData = await response.data.sessions;
            // console.log(jsonData); // Log the JSON data
            console.log('LegiScan.getSessionList: got ' + Object.keys(jsonData).length + ' sessions');
            return jsonData;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    /**
     * Retrieves json data from LegiScan getDatasetList API call
     * @param {string} state The 2 leter state code 
     * @param {string} year  The year to pull datasets
     * @returns {json}
     */
    async getDataSetList(state, year) {
        const apiCall = `${this.baseUrl}?key=${this.apiKey}&op=getDatasetList&state=${state}&year=${year}`
        try {
            const response = await axios.get(apiCall);
            if (!response.status==200) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const jsonData = await response.data;
            console.log('LegiScan.getDataSetList: got json'); // don't want to log this json, it's huge
            return jsonData;
        } catch (error) {
            console.error('LegiScan.getDataSetList:err', error);
            throw Error('LegiScan.getDataSetList failed',error);
        }
    }

    /**
     * Retrieves json data from LegiScan getDataset API call
     * @param {number} dataSetId 
     * @param {string} accessKey 
     * @returns {json}
     */
    async getDataSet(dataSetId, accessKey) {
        const apiCall = `${this.baseUrl}?key=${this.apiKey}&op=getDataset&id=${dataSetId}&access_key=${accessKey}`;
        try {
            const response = await axios.get(apiCall);
            if (!response.status==200) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const jsonData = await response.data;
            console.log('LegiScan.getDataSet: got json'); // don't want to log this json, it's huge
            return jsonData;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
}

module.exports = LegiScan;