//middleware - обычная функция, которая позволяет перехватывать 
//данные и выполнять логику, описанную в нём
//метод next, который продолжит выполнять запрос
const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    //проверим доступность сервера
    if (req.method === 'OPTIONS') {
        //продолжаем выполнять запрос
        return next()
    }

    //если это обычный запрос, то выполняем дальше
    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"
 
        //проверяем, есть ли токен
        if (!token) {
            return res.status(401).json({message: "Нет авторизации"})//нет авторизации
        }

        //если токен есть, нужно его раскодировать
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        //раскодированный токен
        req.user = decoded
        next()
    } catch (e) {
        res.status(401).json({message: "Нет авторизации"})
    }
}