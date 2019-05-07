const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport') //引入passport 
const app = express()

//引入router.js
const users = require('./routes/api/users')
const profiles = require('./routes/api/profiles')

app.use(passport.initialize()); //初始化passport

require('./config/passport')(passport)
//引入数据库地址
const db = require('./config/keys').mongoURL
//链接数据库
mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log('Mongodb数据库链接成功')
    })
    .catch((err) => {
        console.log(err)
    })
//使用body-parser中间件用来解析post请求
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use('/api/users', users)
app.use('/api/profiles', profiles)
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`服务以启动${port}`)
})