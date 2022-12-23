const express = require('express');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const { post } = require('../models');
const { like } = require('../models');
const { comment } = require('../models');
const authMiddleware = require("../middlewares/auth-middleware");
const sequelize = new Sequelize("database_development", "admin", "spa142857",{
    host: "sparta-gil.cylo4tomjgga.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql",
});


router.get('/', async (req, res) => {
    // Thunder Client api : sparta-gil.shop/posts
    // body : X
    const posts = await post.findAll({
        order: [['createdAt', 'DESC' ]],
    });
    if(posts.length > 0) {
        res.json({
            data: posts
        })
    }else{
        return res.status(404).json({success: false, message: '게시글이 없습니다.'});
    }    
});

router.post('/', authMiddleware, async (req, res) => {
    // Thunder Client api : sparta-gil.shop/posts
    // body : {"title": "글제목", "content": "안녕하세요 4번째 글입니다."}
    const {title, content } = req.body;
    if ([title, content].includes('')){
        return res.status(412).json({success: false, message: '게시글 형식이 올바르지 않습니다.'});
    }
    const userId  = res.locals.user.userId;
    const like = 0;
    var createdAt = moment.utc();
    const createdPosts = await post.create({ userId, title, content, like, createdAt});
    
    res.json({success: true, message: '게시글을 생성하였습니다.'})
})

router.get('/:postId', async (req, res) => {
    // Thunder Client api : sparta-gil.shop/posts/10
    // body : X
    const {postId} = req.params;
    const posts = await post.findOne({where: {postId: Number(postId)}});
    if(posts){
        return res.json({'data': posts});
    }else{
        return res.status(400).json({success: false, message: '게시글 조회에 실패하였습니다.'})
    }
})

router.put('/:postId', authMiddleware, async (req,res) => {
    // Thunder Client api : sparta-gil.shop/posts/10
    // body : {"content": "안녕하세요 수정된 글입니다."}
    const {postId} = req.params;
    const { title, content} = req.body;
    const user  = res.locals.user;
    if ([title, content].includes('')){
        return res.status(412).json({success: false, message: '게시글 형식이 올바르지 않습니다.'});
    }
    const posts = await post.findOne({where: {postId: Number(postId)}});
    if(posts){
        if(posts.userId === user.userId){
            const modifyAt = moment.utc();
            await post.update({title: title, content: content, modifyAt: modifyAt}, {where: {postId: Number(postId)}});
            res.json({success: true, message: '게시글을 수정하였습니다.'})
        } else{
            return res.status(412).json({success: false, message: '본인이 쓴 글이 아닙니다.'})
        }
    } else{
        return res.status(400).json({success: false, message: '게시글 수정에 실패하였습니다.'})
    }
})

router.put('/:postId/like', authMiddleware, async (req,res) => {
    // Thunder Client api : sparta-gil.shop/posts/10/like
    // body : X
    const {postId} = req.params;
    const userId  = res.locals.user.userId;
    const posts = await post.findOne({where: {postId: Number(postId)}});
    if(posts){
        const likes = await like
                    .findOne({where: {
                            postId: Number(postId),
                            userId: userId
                    }})
        if(likes){
            console.log('취소 전 현재 좋아요 수:' + posts.like)
            posts.like = posts.like - 1;
            await posts.save();
            await like.destroy({where: {
                            postId: Number(postId),
                            userId: userId
                        }})
            res.json({success: true, message: '게시글의 좋아요를 취소하였습니다.'})
        } else{
            console.log('등록 전 현재 좋아요 수:' +posts.like)
            posts.like = posts.like + 1;
            await posts.save();
            await like.create({postId, userId})
            res.json({success: true, message: '게시글의 좋아요를 등록하였습니다.'})
        }
        
    } else{
        return res.status(404).json({success: false, message: '게시글이 존재하지 않습니다.'})
    }
})

router.patch('/like', authMiddleware, async (req, res) => {
    // Thunder Client api : sparta-gil.shop/posts/like
    // body : X
    // 글 상세보기와 겹쳐서 get을 patch로 변경
    const userId = res.locals.user.userId;
    const posts = await sequelize.query(
        `SELECT p.postId, p.userId, u.nickname, p.title, p.content, p.createdAt, p.updatedAt, p.like 
        FROM posts p INNER JOIN likes l ON p.postId = l.postId INNER JOIN users u ON ` + userId + ` = u.userId
        WHERE ` + userId + ` = l.userId`,
        {
            raw:true,
            nest:true,
        }
    )
    if(!posts){
        return res.status(404).json({success: false, message: '게시글이 존재하지 않습니다.'})
    }
    res.json(posts);
})

router.delete('/:postId', authMiddleware, async (req,res) => {
    // Thunder Client api : sparta-gil.shop/posts/10
    // body : X
    const {postId} = req.params;
    const user  = res.locals.user;
    const posts = await post.findOne({where: {postId: Number(postId)}});
    if(posts){
        if(user.userId === posts.userId){
            await post.destroy({where : {postId: Number(postId)}})
            await comment.destroy({postId: Number(postId)});
            res.json({success: true, message: '게시글을 삭제하였습니다.'})
        } else{
            return res.status(412).json({success: false, message: '본인이 쓴 글이 아닙니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '게시글이 존재하지 않습니다.'})
    }
})

module.exports = router;