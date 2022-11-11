const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  favList: [],
  time: Number
}, { collection: 'users' })

module.exports = mongoose.model('users', userSchema)