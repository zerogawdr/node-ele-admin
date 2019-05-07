//@login & register

const express = require('express')
const router = express.Router()
//引入密码加密模块 需要安装
const bcrypt = require('bcryptjs');
//引入models里的user模型
const User = require('../../models/User')
//引入gravatar头像插件
const gravatar = require('gravatar');
//引入设置token插件 jsonwebtoken jst
const jwt = require('jsonwebtoken');
//引入keys.secret
const keys = require('../../config/keys')
//引入passport
const passport = require('passport')
// api/users/test
router.get('/test', (req, res) => {
    res.json({
        msg: 'login works'
    })
})

//注册
router.post('/register', (req, res) => {
    //查询数据库中是否已有邮箱
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                return res.status(400).json(
                    '邮箱已被注册'
                )
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //SS是头像显示的大小
                    r: 'pg', //pg是全球公认网邮箱头像的后缀格式
                    d: 'mm'
                }); //mm当没有找到邮箱时候默认给一个灰色圆图片当头像
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar,
                    identity: req.body.identity

                })
                //密码加密
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    });
                });
            }
        })
})

//登录
//设置token的插件 jsonwebtoken
//登录返回一个token 用于验证用户信息 
router.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    //查询数据存不存在
    User.findOne({
            email
        })
        .then(user => {
            if (!user) {
                return res.status(404).json(
                    '用户不存在'
                )
            }
            //密码匹配
            bcrypt.compare(password, user.password) //传过来的密码,数据库中的密码
                .then(result => { //相同返回true否则false 
                    if (result) {
                        //登录成功设置token组成规则
                        const rule = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar,
                            identity: user.identity
                        }
                        //jwt.sigm('规则','加密名字','过期时间',''箭头函数)
                        jwt.sign(rule, keys.secretOrKey, {
                            expiresIn: 3600
                        }, (err, token) => {
                            if (err) throw err;
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        })
                    } else {
                        res.status(400).json(
                            '密码错误'
                        )
                    }
                })
        })
})

//登录后可以请求到的数据 
//验证token passport  passport-jwt server.js中引入passport 
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        identity: req.user.identity,
        avatar: req.user.avatar
    })

})
//查询个人信息
// router.get('/:id',passport.authenticate(jwt,{session:false},(req,res)=>{}))
module.exports = router