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

        const curriculumPrincipal = curriculumListResponse.data.find(curriculum => curriculum.principal)
        const curriculumId = curriculumPrincipal.code

        const endpoints = [
            `/api/1/curriculum/${curriculumId}/cvtext`,
            `/api/1/curriculum/${curriculumId}/education`,
            `/api/2/curriculum/${curriculumId}/experience`,
            `/api/4/curriculum/${curriculumId}/futurejob`,
            `/api/2/curriculum/${curriculumId}/skill`,
            `/api/7/offer/${offerId}`,
        ];

        const responses = await Promise.allSettled(endpoints.map(endpoint =>
            axios.get(`https://api.infojobs.net${endpoint}`, {
                headers: { 
                    'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },            
            }).catch(error => {
                console.error(`Error in GET ${endpoint}: ${error.message}`);
                return error;
            })
        ));
        
        const successfulResponses = responses
            .filter(response => response.status === 'fulfilled')
            .map(response => response.value.data);
        
        console.log(successfulResponses);
        
        // const failedResponses = responses
        //     .filter(response => response.status === 'rejected')
        //     .map(response => response.reason);
        
        res.json(
            successfulResponses
        );

    } catch (error) {
        res.status(500).send(error.message)
        console.error(error.message)
    }
});

app.get('/api/ping', (req, res) => {
    res.status(200).send("pong");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app;
