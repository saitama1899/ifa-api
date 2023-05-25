const express = require('express')
const axios = require('axios')
const cors = require('cors')
const { Configuration, OpenAIApi } = require("openai")

const {
    initialPrompt,
    getOfferDescription,
    getProfileDescription,
} = require('./prompt')

const {
    convertStringToObject
} = require('./utils')


require('dotenv').config()

const app = express()
app.use(cors())

app.use(express.json())

app.post('/api/infojobs', async (req, res) => {
    const accessToken = req.body.accessToken
    const offerId = req.body.offerId
    const hash = process.env.HASH
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    try {
        const curriculumListResponse = await axios.get('https://api.infojobs.net/api/2/curriculum', {
            headers: { 
                'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const curriculumPrincipal = curriculumListResponse.data.find(curriculum => curriculum.principal)
        const curriculumId = curriculumPrincipal.code

        const offer = await axios.get(`https://api.infojobs.net/api/7/offer/${offerId}`, {
            headers: { 
                'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })
        const offerInfo = offer?.data

        const endpoints = [
            `/api/1/curriculum/${curriculumId}/cvtext`,
            `/api/1/curriculum/${curriculumId}/education`,
            `/api/2/curriculum/${curriculumId}/experience`,
            `/api/4/curriculum/${curriculumId}/futurejob`,
            `/api/2/curriculum/${curriculumId}/skill`,
        ]

        const responses = await Promise.allSettled(endpoints.map(endpoint =>
            axios.get(`https://api.infojobs.net${endpoint}`, {
                headers: { 
                    'Authorization': `Basic ${hash}, Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },            
            }).catch(error => {
                console.error(`Error in GET ${endpoint}: ${error.message}`)
                return error
            })
        ))
        
        const curriculumInfo = responses
            .filter(response => response.status === 'fulfilled')
            .reduce((acc, response) => ({ ...acc, ...response.value.data }), {})


        const initial = initialPrompt(curriculumInfo, offerInfo)
        const curriculumDescription = getProfileDescription(curriculumInfo)
        const offerDescription = getOfferDescription(offerInfo)
        let messages = [
            {role: "system", content: "You are a helpful job assistant."},
            {role: "user", content: initial},
            {role: "user", content: curriculumDescription},
            {role: "user", content: offerDescription},
        ];
        // console.log(prompt);
        // const maxTokens = 200

        // const gptResponse = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: messages,
        //     temperature: 0.6,
        // })
        // const gptText = gptResponse.data.choices[0]?.message?.content
        // const gptObject = convertStringToObject(gptText)
        res.json({
            response: curriculumDescription
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
})

app.get('/api/ping', (req, res) => {
    res.status(200).send("pong")
})

// const PORT = process.env.PORT || 3000
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
// })

module.exports = app
