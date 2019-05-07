const express = require('express')
const router = express.Router()
//引入models里的user模型
const Profile = require('../../models/profile')
//引入passport
const passport = require('passport')
//  http://localhost:5000/api/profiles/test
router.get('/test', (req, res) => {
    res.json({
        msg: 'profile works'
    })
})

//创建信息接口
router.post('/add', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //验证添加信息是否存在
    const profileFields = {}
    if (req.body.type) profileFields.type = req.body.type
    if (req.body.describe) profileFields.describe = req.body.describe
    if (req.body.incode) profileFields.incode = req.body.incode
    if (req.body.expend) profileFields.expend = req.body.expend
    if (req.body.cash) profileFields.cash = req.body.cash
    if (req.body.remark) profileFields.remark = req.body.remark
    // if (req.body.identity) profileFields.identity = req.body.identity
    new Profile(profileFields).save()
        .then(result => {
            res.json(result)
        })

})
//获取所有信息 
router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.find()
        .then(result => {
            if (!result) {
                return res.status(404).json('没有任何内容')
            }
            res.json(result)
        })
        .catch(err => res.status(404).json(err))
})
//获取单个信息
router.get('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const id = req.params.id
    Profile.findOne({
            _id: id
        })
        .then(result => {
            if (!result) {
                return res.status(404).json('没有任何内容')
            }
            res.json(result)
        })
        .catch(err => res.status(404).json(err))
})

//编辑内容
router.post('/edit/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    console.log(req.params.id)
    //验证添加信息是否存在
    const profileFields = {}
    if (req.body.type) profileFields.type = req.body.type
    if (req.body.describe) profileFields.describe = req.body.describe
    if (req.body.incode) profileFields.incode = req.body.incode
    if (req.body.expend) profileFields.expend = req.body.expend
    if (req.body.cash) profileFields.cash = req.body.cash
    if (req.body.remark) profileFields.remark = req.body.remark
    // if (req.body.identity) profileFields.identity = req.body.identity
    console.log(profileFields)
    Profile.findOneAndUpdate({
            _id: req.params.id
        }, //通过id查询要编辑的内容
        {
            $set: profileFields
        }, //更换的内容
        {
            new: true
        } //是个新的东西 覆盖原来的
    ).then(result => res.json(result))

})

//删除信息接口
router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOneAndRemove({
            _id: req.params.id //通过id找到要删除的内容
        })
        .then(result => { //把删除之后的数据保存数据库之后再把结果返回给前台
            result.save().then(result => res.json(result))
        })
        .catch(err => res.status(404).json('删除失败'))

})







module.exports = router