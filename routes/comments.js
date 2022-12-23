const express = require('express');
const router = express.Router();
const moment = require('moment');
const { comment } = require('../models');
const { post } = require('../models');
const authMiddleware = require("../middlewares/auth-middleware");

router.get('/:postId', async (req, res) => {
    // Thunder Client api : sparta-gil.shop/comments/10
    // body : X
    const { postId } = req.params;
    const comnments = await comment.findAll({
        where: { postId: postId },
        order: [['createdAt', 'DESC' ]],
    });
    if(comnments.length > 0) {
        res.json({
            data: comnments
        })
    }else{
        return res.status(400).json({success: false, message: '댓글이 없습니다.'});
    }    
})

router.post('/:postId', authMiddleware, async (req, res) => {
    // Thunder Client api : sparta-gil.shop/comments/10
    // body : {"content": "안녕하세요 4번째 댓글입니다."}
    const { postId } = req.params;
    const content = req.body.content;
    const userId  = res.locals.user.userId;

    if(content === ''){
        return res.status(400).json({success: false, message: '댓글 내용을 입력해주세요.'});
    }
    const posts = await post.findOne({where: {postId: postId}});
    if(!posts){
        return res.status(400).json({success: false, message: '게시글이 존재하지 않습니다.'});
    }
    const createdAt = moment().utc();
    await comment.create({postId, userId, comment: content, createdAt});
    
    res.json({success: true, message: '댓글을 생성하였습니다.'})
})

router.put('/:commentId', authMiddleware, async (req,res) => {
    // Thunder Client api : sparta-gil.shop/comments/10
    // body : {"content": "안녕하세요 수정된 댓글입니다."}
    const {commentId} = req.params;
    const content = req.body.content;
    const userId  = res.locals.user.userId;
    if(content === ''){
        return res.status(400).json({success: false, message: '댓글 내용을 입력해주세요.'})
    }
    const comments = await comment.findOne({where: {commentId: Number(commentId)}});
    if(comments){
        if(comments.userId === userId){
            const modifyAt = moment().utc();
            await comment.update({comment: content, createdAt: modifyAt}, {where: {commentId: Number(commentId)}});
            res.json({success: true, message: '게시글을 수정하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '해당 댓글을 작성한 사용자가 아닙니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '댓글이 존재하지 않습니다.'})
    }
})

router.delete('/:commentId', authMiddleware, async (req, res) => {
    // Thunder Client api : sparta-gil.shop/comments/5
    // body : X
    const {commentId} = req.params;
    const userId  = res.locals.user.userId;
    const comments = await comment.findOne({where: {commentId: Number(commentId)}});
    if(comments){
        if(comments.userId === userId){
            await comment.destroy({where: {commentId: Number(commentId)}})
            res.json({success: true, message: '댓글을 삭제하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '해당 댓글을 작성한 사용자가 아닙니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '댓글 조회에 실패하였습니다.'})
    }
})

module.exports = router;