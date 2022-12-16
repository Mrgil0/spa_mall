const { Console } = require('console');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const Comments = require('../schemas/comment');
const Posts = require('../schemas/post');

router.get('/', async (req, res) => {
    const comments = await Comments.find().sort({createdAt: -1});

    res.json({
        data: comments
    })
})

router.post('/:_postId', async (req, res) => {
    const { _postId } = req.params;
    const { user, password, content } = req.body;

    if ([_postId, user, password].includes('')){
        return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'});
    } else if(content === ''){
        return res.status(400).json({success: false, message: '댓글 내용을 입력해주세요.'});
    }
    const posts = await Posts.find({postId: _postId});
    if(posts.length <= 0){
        return res.status(400).json({success: false, message: '게시글 조회에 실패하였습니다.'});
    }
    let commentId = 1;
    const comments = await Comments.find().sort({commentId: 1});
    if(comments.length > 0){
        for(let i=0; i<comments.length; i++) {
            let temp = comments[i]['commentId']
            if (temp - commentId >= 1) {
                break;
            }  //db의 index중 비어있는 제일 작은 값이 commentId가 됨
            commentId++
        }
    }
    const createdAt = moment().format('YYYY년 MM월 DD일 hh:mm:ss');
    const createdPosts = await Comments.create({commentId: commentId, postId: _postId, user: user, password: password, content: content, createdAt: createdAt});
    
    res.json({success: true, message: '댓글을 생성하였습니다.'})
})

router.put('/:_commentId', async (req,res) => {
    const {_commentId} = req.params;
    const {password, content} = req.body;
    if(content === ''){
        return res.status(400).json({success: false, message: '댓글 내용을 입력해주세요.'})
    }
    const comments = await Comments.findOne({commentId: Number(_commentId)});
    if(comments){
        if(comments.password === password){
            const modifyAt = moment().format('YYYY년 MM월 DD일 hh:mm:ss');
            await Comments.updateOne({commentId: Number(_commentId)}, {content: content}, {createdAt: modifyAt});
            res.json({success: true, message: '게시글을 수정하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '게시글 조회에 실패하였습니다.'})
    }
})

router.delete('/:_commentId', async (req, res) => {
    const {_commentId} = req.params;
    const { password } = req.body;
    const comments = await Comments.findOne({commentId: Number(_commentId)});
    if(comments){
        if(comments.password === password){
            await Comments.deleteOne({commentId: Number(_commentId)})
            res.json({success: true, message: '댓글을 삭제하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '댓글 조회에 실패하였습니다.'})
    }
})

module.exports = router;