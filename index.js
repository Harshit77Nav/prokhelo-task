const mongoose = require("mongoose");
const app = require("./src/app");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, useUnifiedTopology: true},()=>{console.log("connected to db..");});

app.listen(PORT,()=>{console.log(`server is running on ${PORT}`);})