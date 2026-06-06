const axios = require('axios');

class WatsonxService {
    constructor() {
        this.apiKey = process.env.WATSONX_API_KEY;
        this.projectId = process.env.WATSONX_PROJECT_ID;
        this.url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
        this.iamToken = null;
        this.tokenExpiry = null;
    }

    // Securely fetch and cache the IBM Cloud IAM token
    async getAuthToken() {
        // Return cached token if it's still valid (with a 1-minute safety buffer)
        if (this.iamToken && this.tokenExpiry > Date.now()) {
            return this.iamToken;
        }

        try {
            const response = await axios.post('https://iam.cloud.ibm.com/identity/token',
                `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${this.apiKey}`,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            this.iamToken = response.data.access_token;
            // expires_in is in seconds, convert to ms
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; 
            
            return this.iamToken;
        } catch (error) {
            console.error('[Watsonx] Failed to authenticate with IBM Cloud IAM:', error.message);
            throw error;
        }
    }

    // Core generation method
    async generateText(prompt, modelId = 'meta-llama/llama-3-70b-instruct') {
        const token = await this.getAuthToken();

        try {
            const response = await axios.post(
                `${this.url}/ml/v1/text/generation?version=2023-05-29`,
                {
                    input: prompt,
                    parameters: {
                        decoding_method: 'greedy',
                        max_new_tokens: 2000,
                        repetition_penalty: 1.05
                    },
                    model_id: modelId,
                    project_id: this.projectId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            return response.data.results[0].generated_text;
        } catch (error) {
            console.error('[Watsonx] Generation failed:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new WatsonxService();