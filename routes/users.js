const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { user } = require('../models');

router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;

    const existUsers = await user.findOne({
        where: { nickname: nickname, password: password}
    });
    if(!existUsers){
        return res.status(400).json({success: false, message: '아이디 또는 패스워드가 틀립니다.'})
    }

    const accessToken = await jwt.sign({userId: existUsers.nickname}, 'sparta-secret-key', {expiresIn: '1d'})
    const refreshToken = await jwt.sign({}, 'sparta-secret-key', {expiresIn: '7d'})

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.send({
        accessToken
    })
})

router.post('/signup', async (req, res) => {
    const { nickname, password, confirmPassword } = req.body;
    const idRegex = /^[a-zA-Z0-9]{3,15}$/     // 영어 & 숫자가 나오면서 3-15글자 사이여야 통과됨
    const pwRegex = /^[a-zA-Z0-9]{4,15}$/
    if(password != confirmPassword){
        return res.status(412).json({success: false, message: '패스워드가 일치하지 않습니다.'}) 
    } else if(idRegex.test(nickname) === false){
        return res.status(412).json({success: false, message: 'ID의 형식이 일치하지 않습니다.'})
    } else if(pwRegex.test(password) === false){
        return res.status(412).json({success: false, message: '패스워드 형식이 일치하지 않습니다.'})
    } else if(password.includes(nickname)){
        return res.status(412).json({success: false, message: '패스워드에 닉네임이 포함되어 있습니다.'})
    }
    const existUsers = await user.findAll({
        where: {
            nickname,
        }
    })
    if(existUsers.length > 0){
        return res.status(412).json({success: false, message: '중복된 닉네임입니다.'})
    }
    await user.create({nickname, password})
    res.status(201).send({ message: "회원 가입에 성공하였습니다." });
})

module.exports = router;