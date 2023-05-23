const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/infojobs', async (req, res) => {
    const accessToken = req.body.accessToken;
    const offerId = req.body.offerId;

    const clientId = '9a3461370cad412298bebf3dec098ede';
    const clientSecret = 'DCDxBw9SLFwVP8rmJL1Td4uAEQseSMLIPeUM01b6vXR/BLYxOq';
    const hash = 'OWEzNDYxMzcwY2FkNDEyMjk4YmViZjNkZWMwOThlZGU6RENEeEJ3OVNMRndWUDhybUpMMVRkNHVBRVFzZVNNTElQZVVNMDFiNnZYUi9CTFl4T3E='

    // Codificamos las credenciales en base64 para crear el token básico
    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const curriculumListResponse = await axios.get('https://api.infojobs.net/api/2/curriculum', {
            headers: { 
                'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

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
                headers: { 'Authorization': `Basic ${hash}, Bearer ${accessToken}` },
            })
        ));

        const data = responses.map(response => response.data);
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message, accessToken);
    }
});

app.get('/api/ping', (req, res) => {
    res.status(200).send("pong");
});

module.exports = app;
