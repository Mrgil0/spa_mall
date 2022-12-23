const express = require('express');
const app = express();
const port = 3000;
const posts = require('./routes/posts');
const comments = require('./routes/comments');
const users = require('./routes/users');
const cookies = require("cookie-parser");

app.use(express.json()); 
app.use(cookies());  

app.get('/', (req, res) => {
  return res.status(400).json({success: false, message: '메인페이지는 아직 지원하지 않습니다.'})
  });

app.use("/posts", [posts]);

app.use("/comments", [comments]);

app.use("/users", [users]);

app.listen(port, () => {
    console.log(port, '포트로 서버가 열렸어요!');
});