require("dotenv").config()
const app= require("./src/app")
const connectToDB = require("./src/config/database")

const startServer = async()=>{
    try{
        await connectToDB();

        app.listen(3000,()=>{
            console.log("Server is running on port 3000");
        });
    }
    catch(err){
        console.log("Failed to start server:",err)
    }
};

startServer();