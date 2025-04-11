const express = require('express');
const { SearchServiceClient } = require('@google-cloud/discoveryengine');
const path = require('path');

const router = express.Router();

// Initialize Google Cloud Search Client
const searchClient = new SearchServiceClient({
    keyFilename: path.join(__dirname, '../shift-scheduler-project-d2178dba5fdb.json'),
});

const projectId = 'shift-scheduler-project';
const location = 'global';
const collectionId = 'default_collection';
const searchEngineId = 'cso-chatbot-queries-v1_1703993260678';
const servingConfigId = 'default_config';

// Chatbot search endpoint
router.post('/ask', async (req, res) => {
    const query = req.body.query;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const parent = `projects/${projectId}/locations/${location}/collections/${collectionId}/dataStores/${searchEngineId}/servingConfigs/${servingConfigId}`;
        const request = { parent, query, pageSize: 5 };

        const [searchResponse] = await searchClient.search(request);

        const formattedResponses = searchResponse.results.map(result => ({
            title: result.document.structData.title || 'No Title',
            snippet: result.document.structData.content || 'No Content',
            link: result.document.structData.link || 'No Link',
        }));

        res.json({ responses: formattedResponses });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

module.exports = router;
