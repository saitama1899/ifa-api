const express = require('express');
const axios = require('axios');
const cors = require('cors')
const openai = require('openai');
const generatePrompt = require('./prompt');  // Asegúrate de que la ruta es correcta

require('dotenv').config();

const app = express();
app.use(cors())

app.use(express.json());

app.post('/api/infojobs', async (req, res) => {
    const accessToken = req.body.accessToken;
    const offerId = req.body.offerId;
    const hash = process.env.HASH;
    openai.apiKey = process.env.OPENAI_API_KEY;
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
        const offerInfo = offer?.data;

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

        // TODO
        const prompt = generatePrompt(curriculumInfo, offerInfo);
        const maxTokens = 60;
        const openaiResponse = await openai.Completion.create({
            engine: "text-davinci-003.5-turbo",
            prompt: prompt,
            max_tokens: maxTokens,
        });
        const gptResponse = openaiResponse.data.choices[0].text.trim();
        res.json({
            gptResponse
        })

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
