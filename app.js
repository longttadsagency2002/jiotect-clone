const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World từ Express!');
});

app.listen(port, () => {
  console.log(`App đang chạy tại http://localhost:${port}`);
});
