require('dotenv').config()

module.exports = {

    PORT: process.env.PORT,
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD,
    DATABASENAME: process.env.DATABASENAME,
    APPSECRET: process.env.SECRET
}