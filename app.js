require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cors = require('cors');
const app = express();


//routes initialization
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');


//to parse request and convert request to a json
app.use(bodyParser.json());
//to set cookieparser
app.use(cookieParser());
//to set cors
app.use(cors());
//to secure HTTP headers
app.use(helmet())
//sanitize data
app.use(xss());
//sanatize mongoDB querys
app.use(mongoSanitize());


//connecting to mongoDB
mongoose.connect(process.env.DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log('DB connected')
}).catch((err)=>{
    console.log('Error while connecting to db:',err)
});


//api routes
//!imp always routes below middlewares like bodyparser
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',productRoutes);
app.use('/api',orderRoutes);


//setting the port
const  port = process.env.PORT || 8000 ;
app.listen(port,() =>{
    console.log(`App is running at ${port}`);
});