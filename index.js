const express = require('express');  
const route = require('./src/routes/route');
const cors = require('./pkg/middleware/cors');

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

app.use("/api/v1", route)

app.listen(port, () => {
  console.log(`Server berjalan di ${port}`);
});
