const { response } = require('express')
const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 5000

app.use(express.static('./public'))

app.get('/game', (request, response) => {
    response.sendFile(path.resolve('./public/game.html'))
})

app.get('*', (request, response) => {
    response.sendFile(path.resolve('./public/index.html'))
})

app.listen(port, () => {
    console.log('Listening on port ' + port)
})