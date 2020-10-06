const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    //приложение по сокращению ссылок, поэтому
    //у каждого пользователя будут свои ссылки
    //модель коллекции
    links: [{type: Types.ObjectId, ref: 'Link'}]
})

module.exports = model('User', schema)