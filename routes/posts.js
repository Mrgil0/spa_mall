const { Console } = require('console');
const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post');
const Comments = require('../schemas/comment');

router.get('/', async (req, res) => {
    const posts = await Posts.find().sort({createdAt: -1});

    res.json({
        data: posts
    })
});

router.post('/', async (req, res) => {
    const { user, password, title, content } = req.body;
    if ([user, password, title, content].includes('')){
        return res.status(400).json({success: false, message: '메세지 형식이 올바르지 않습니다.'});
    }
    const posts = await Posts.find().sort({postId: 1});
    let postId = 1;
    if(posts.length > 0){
        for(let i=0; i<posts.length; i++) {
            let temp = posts[i]['postId']
                if (temp - postId >= 1) {
                    break;
                }  //db의 index중 비어있는 제일 작은 값이 postId 됨
            postId++;
        }
    }
    
    const createdAt = new Date();
    const createdPosts = await Posts.create({postId, user, password, title, content, createdAt});
    
    res.json({success: true, message: '게시글을 생성하였습니다.'})
})

router.get('/:_postId', async (req, res) => {
    const {_postId} = req.params;
    const posts = await Posts.findOne({postId: Number(_postId)});
    if(posts){
        return res.json({'data': posts});
    }else{
        return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'})
    }
})

router.put('/:_postId', async (req,res) => {
    const {_postId} = req.params;
    const {password, title, content} = req.body;
    const posts = await Posts.findOne({postId: Number(_postId)});
    if(posts){
        if(posts.password === password){
            const modifyAt = new Date();
            await Posts.updateOne({title: title}, {content: content}, {createdAt: modifyAt});
            res.json({success: true, message: '게시글을 수정하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '게시글 조회에 실패하였습니다.'})
    }
})

router.delete('/:_postId', async (req,res) => {
    const {_postId} = req.params;
    const { password } = req.body;
    const posts = await Posts.findOne({postId: Number(_postId)});
    if(posts){
        if(posts.password === password){
            await Posts.deleteOne({postId: Number(_postId)})
            await Comments.deleteMany({postId: Number(_postId)});
            res.json({success: true, message: '게시글을 삭제하였습니다.'})
        } else{
            return res.status(400).json({success: false, message: '데이터 형식이 올바르지 않습니다.'})
        }
    } else{
        return res.status(404).json({success: false, message: '게시글 조회에 실패하였습니다.'})
    }
})

module.exports = router;