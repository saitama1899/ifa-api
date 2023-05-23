const express = require('express');
const axios = require('axios');
const cors = require('cors')
require('dotenv').config();

const app = express();
app.use(cors())

app.use(express.json());

app.post('/api/infojobs', async (req, res) => {
    const accessToken = req.body.accessToken;
    const offerId = req.body.offerId;

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const hash = process.env.HASH;

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

        const offer = await axios.get(`https://api.infojobs.net/api/7/offer/${offerId}`, {
            headers: { 
                'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        const offerData = offer.data;

        const endpoints = [
            `/api/1/curriculum/${curriculumId}/cvtext`,
            `/api/1/curriculum/${curriculumId}/education`,
            `/api/2/curriculum/${curriculumId}/experience`,
            `/api/4/curriculum/${curriculumId}/futurejob`,
            `/api/2/curriculum/${curriculumId}/skill`,
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
        
        const curriculumInfo = responses
            .filter(response => response.status === 'fulfilled')
            .map(response => response.value.data);
        
        // const failedResponses = responses
        //     .filter(response => response.status === 'rejected')
        //     .map(response => response.reason);
        
        res.json({
            curriculumInfo,
            offerData
    });

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
