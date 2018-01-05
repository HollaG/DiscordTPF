// check links!

const config = require("../configuration/config.json");
const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
var db_config = {
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,

    database: "scores",
    charset: "utf8"
}
var connection;
function handleDisconnect() {
    connection = mysql.createConnection(db_config); 
    connection.connect(function (err) {              
        if (err) {                                   
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
        }                                    
    });                            
    connection.on('error', function (err) {
        console.log('db error in file links.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") { 
            handleDisconnect();                        
        } else {                                     
            throw err;                                  
        }
    });
}
handleDisconnect();
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
