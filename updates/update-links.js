const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const mysql = require("mysql");
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
        console.log('db error in file update-links.js', err);
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

function commitSQL() {
    connection.commit(function (err) {
        if (err) {
            return connection.rollback(function () {
                return console.log(err);
            });
        }
        
    });
}

module.exports.updateLink = (message, args, selector) => { 
    connection.beginTransaction(function (err) { 
        connection.query(`SELECT * FROM links WHERE userId = ?`, [message.author.id], function(err, results) { 
            if (!results.length) { 
                connection.query(`INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)`, [message.author.id, message.author.username, "set link", "set link", "set link"], function (err, results) { 
                    if (err) return console.log(err)
                    connection.query(`UPDATE links SET ?? = ? WHERE userId = ?`[selector, args, message.author.id])
                })
            } else { 
                connection.query(`UPDATE links SET ?? = ? WHERE userId = ?`, [selector, args, message.author.id], function (err, results) { 
                    if (err) return console.log(err)
                })

            }
        })
    commitSQL()
    })
}

module.exports.updateAll = (message, args) => { 
    connection.beginTransaction(function(err) { 
        connection.query(`SELECT * FROM links WHERE userId = ?`, [message.author.id], function(err, results) { 
            if (!results.length) { 
                connection.query(`INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)`, [message.author.id, message.author.username, args[0], args[1], args[2]], function (err, results) { 
                    if (err) return console.log(err)
                })
            } else { 
                var linkObj = { 
                    twitch: args[0],
                    youtube: args[1],
                    steam: args[2]
                }
                connection.query(`UPDATE links SET ? WHERE userId = ${message.author.id}`, linkObj, function(err, results) { 
                    if (err) return console.log(err)
                })
            }
        })
    commitSQL()
    })
}