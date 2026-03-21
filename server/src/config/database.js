const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connectd" );
     } catch(err){
            console.error("mongodb connection error",err);
            process.exit(1);
        }
    };
module.exports=connectDB
