const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/infojobs', async (req, res) => {
    const accessToken = req.body.accessToken;
    const offerId = req.body.offerId;

    try {
        // First, get the list of curriculums
        const curriculumListResponse = await axios.get('https://api.infojobs.net/api/2/curriculum', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        // Extract the curriculumId from the first curriculum in the list
        // (or implement your own logic for choosing which curriculum to use)
        const curriculumId = curriculumListResponse.data[0].id;

        const endpoints = [
            `/api/1/curriculum/${curriculumId}/cvtext`,
            `/api/1/curriculum/${curriculumId}/education`,
            `/api/1/curriculum/${curriculumId}/experience`,
            `/api/1/curriculum/${curriculumId}/futurejob`,
            `/api/1/curriculum/${curriculumId}/skill`,
            `/api/1/offer/${offerId}`,
        ];

        const responses = await Promise.all(endpoints.map(endpoint =>
            axios.get(`https://api.infojobs.net${endpoint}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            })
        ));

        const data = responses.map(response => response.data);
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = app;