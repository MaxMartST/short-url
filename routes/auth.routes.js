const {Router} = require('express')
//npm i express validator -валидация форм на сервере
const {check, validationResult} = require('express-validator')
//npm i jsonwebtoken для создания токена
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const router = Router()

// arg-1 /api/auth/register
// arg-2 logic
// между 1 и 2 валидация - проверка
router.post(
    '/register',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длинна пароля 8 символов').isLength({min: 8})
    ],
    async (req, res) => {
    try {
        //console.log('Body: ', req.body);
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Некорректные данные при регистрации"
            })
        }

        const {email, password} = req.body

        //ищем такойже имэил при регистрации
        const candidate = await User.findOne({email: email})

        if (candidate) {
            return res.status(400).json({message: "Такой пользователь уже существует"})
        }

        //если наддый if не отработал, то регистрируем данного пользователя
        //шифруем пароль npm i bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email: email, password: hashedPassword})

        //сохраняем пользователя и добавляеи в БД
        await user.save()
        res.status(201).json({message: "Пользователь создан"})
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"})
    }
})

router.post(
    '/login', 
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Некорректные данные при входе в систему"
            })
        }

        const {email, password} = req.body

        const user = await User.findOne({email: email})

        if (!user) {
            return res.status(400).json({message: "Пользователь не найден"})
        }

        //пароли не совпадают
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({message: "Неверный пароль, попробуйте снова"})
        }

        //создание токена
        // 1 параметр - объект с зашифрованными данными в токене
        // 2 параметр - секретный ключ
        // 3 параметр - через сколько JWT токен закончит существование
        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"})
    }
})

module.exports = router