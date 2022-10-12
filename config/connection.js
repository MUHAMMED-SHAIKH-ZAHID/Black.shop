require('dotenv').config(); 
const mongoose = require("mongoose");

const connection = {
    mongoURI :process.env.MONGO_URI,
  connect: () => {
    mongoose
      .connect(connection.mongoURI)
      .then((res) => {
        console.log("data connected");
      })
      .catch((err) => console.log(err,"aljkdlsajdlajdlkj"));
  },
};
module.exports = connection;

