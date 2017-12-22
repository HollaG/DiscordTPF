// check links!

const config = require("../configuration/config.json");
const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
const connection = mysql.createConnection({
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,
    database: "scores",
    charset: "utf8"

})
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.checkLinks = (message, command) => {
    var website = capitalizeFirstLetter(command)
    connection.query("SELECT * FROM links WHERE userId = ?", [message.author.id], function(err, results) { 
        message.reply(` your link to ${website} is ${results[0][command]}`)
        
    })
    
}

connection.on('error', function(err) { 
    console.log(err.code) 
    connection.query('SELECT 1')
})