const express = require('express');
const app = express.Router();
const port = 3000;
const goods = require('./routes/good.js');
app.use("/api", [goods])

const connect = require("./schemas");
connect();

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});