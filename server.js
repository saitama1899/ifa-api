const express = require('express');
const axios = require('axios');
const cors = require('cors')

const app = express();
app.use(cors())

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
        // [
        //     {
        //         "id": 33695177462,
        //         "code": "c844dbca-efe1-4fe8-8c87-1e9de645c6d9",
        //         "name": "Eric",
        //         "principal": true,
        //         "completed": true,
        //         "incompleteSteps": []
        //     }
        // ]
        const curriculumPrincipal = curriculumListResponse.data.find(curriculum => curriculum.principal);
        const curriculumId = curriculumPrincipal.id;
        res.json(curriculumId);
    } catch (error) {
        res.status(500).send(error.message)
    }
});

app.get('/api/ping', (req, res) => {
    res.status(200).send("pong");
});

module.exports = app;
