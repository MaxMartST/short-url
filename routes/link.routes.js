const {Router} = require('express')
const config = require('config')
const shortid = require('shortid')
const Link = require('../models/Link')
const auth = require('../middleware/auth.middleware')

const router = Router()

//обработаем несколько запросов
//пост-запрос на генерацию ссылки
router.post('/generate', auth, async (req, res) => {
    try {
        const baseUrl = config.get('baseUrl')
        const {from} = req.body

        const code = shortid.generate()

        //проверим, если такая ссылка from
        const existing = await Link.findOne({from})

        //если есть, то отправляем её же
        if (existing) {
            return res.json({link: existing})
        }

        //формируем сокращённую ссылку
        const to = baseUrl + '/t/' + code

        const link = new Link({
            code,
            to,
            from, 
            owner: req.user.userId
        })

        await link.save()
        res.status(201).json({link})
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"})
    }
})

//гет-запрос на получение всех ссылок
router.get('/', auth, async (req, res) => {
    try {
        //чтобы определить какой пользователь ищет ссылки, нужно получить его
        //с фронтенда по jwtToken, в нем мы закодировали userId
        //создадим middleware, который будет проверять авторизован пользователь или нет
        const links = await Link.find({owner: req.user.userId})
        res.json(links)
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"})
    }
})

//гет-запрос на получение ссылки по id
router.get('/:id', auth, async (req, res) => {
    try {
        const link = await Link.findById(req.params.id)
        res.json(link)
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"})
    }
}) 

module.exports = router