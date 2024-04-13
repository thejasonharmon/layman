class LegiScan {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.legiscan.com/';
    }

    async getMasterList(state, setData, setLoading, setError) {
        const apiPrefix = `${this.baseUrl}?key=${this.apiKey}&op=getMasterList&state=${state}`;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiPrefix);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const jsonData = await response.json();
            console.log(jsonData); // Log the JSON data
            setData(jsonData);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async getSessionList(state, setData, setLoading, setError) {
        const apiPrefix = `${this.baseUrl}?key=${this.apiKey}&op=getSessionList&state=${state}`;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiPrefix);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const jsonData = await response.json();
            console.log(jsonData); // Log the JSON data
            setData(jsonData);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
}

export default LegiScan;