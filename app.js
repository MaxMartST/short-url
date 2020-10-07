const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')

const app = express()

app.use(express.json({extended: true}))
//роутеры для авторизации пользователей
app.use('/api/auth', require('./routes/auth.routes'))
//роутеры для работы с сылками
app.use('/api/link', require('./routes/link.routes'))
//роутер для перехода по ссылке
app.use('/t', require('./routes/redirect.routes'))

if (process.env.NODE_ENV === 'production') {
    //сформировали статическую папку
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))
    //любой get запрос будем отправлять 
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))        
        //таким образом у нас будет работать и бэк и фронт одновременно
        //нода будет за фсё отвечать
    })
}

const PORT = config.get('port') || 5000

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => {
            console.log(`App has benn started on port ${PORT}...`)
        })
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()