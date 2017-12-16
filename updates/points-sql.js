const mysql = require("mysql");
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: "holla",
    password: tokenId.pass,
    database: "scores"

})
const config = require("../configuration/config.json");

function commitSQL() {
    connection.commit(function (err) {
        if (err) {
            return connection.rollback(function () {
                return console.log(err);
            });
        }
        
    });
}

module.exports.updatePoints = (message) => {

    //connection.connect();
    connection.query('SELECT * FROM points WHERE userId = ?', [message.author.id], function (error, results, fields) {
        if (results.length === 0) { // if no row
            //console.log(error);
            

            connection.beginTransaction(function (err) {
                if (err) return console.log(err) 
                var post = {
                    userId: message.author.id,
                    username: message.author.username,
                    points: 1,
                    level: 0,
                }
                var query = connection.query('INSERT INTO points SET ?', post, function (err, results, fields) {
                    if (err) return console.log(err) 
                })
                console.log(query.sql)
                commitSQL()
                //connection.end()
            })
        } else { // if row
            
            connection.beginTransaction(function (err) {
                if (err) return console.log(err)
                connection.query('UPDATE points SET points = ? WHERE userId = ?', [results[0].points + 1, message.author.id])
                commitSQL()
            })
            let curLevel = Math.floor(0.1 * Math.sqrt(results[0].points + 1));
            if (curLevel > results[0].level) {
                console.log("level up!")

                connection.beginTransaction(function (err) {
                    if (err) return console.log(err) 
                    connection.query('UPDATE points SET points = ?, level = ? WHERE userId = ?', [results[0].points + 1, curLevel, message.author.id])
                    message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`)
                    commitSQL()
                })

            }

        }
    })
    connection.query('SELECT * FROM links WHERE userId = ?', [message.author.id], function(err, results, fields) {         
        if (!results[0]) { 

            var links = { 
                userId: message.author.id,
                username: message.author.username,
                twitch: "`Nothing here!`",
                youtube: "`Nothing here!`",
                steam: "`Nothing here!`"
            }
            connection.query('INSERT INTO links SET ?', links, function (err, results, fields) { 
                if (err) return console.log(err)
            })
        }
    })




    //connection.end()
}




module.exports.checkInformation = (message) => {
    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase()
    let nameofuser;
    let usernumber;
    if (message.mentions.users.first()) {
        usernumber = message.mentions.users.first().id
        nameofuser = message.mentions.users.first().username
    } else {
        usernumber = message.author.id
        nameofuser = message.author.username
    }
    if (command === "mcount") {
        connection.query('SELECT points FROM points WHERE userId = ?', [usernumber], function (error, results, fields) {           
            if (!results[0]) {                
                return message.channel.send("Sadly no messages have been sent by them yet!") // this should never ever need to run 
            } else {                 
                message.channel.send(`${nameofuser} has sent \`${results[0].points}\` messages to date.`)
            }
            
        })


    }
    if (command === "level") {
        connection.query('SELECT level FROM points WHERE userId = ?', [usernumber], function (err, results, fields) {
            if (!results[0]) { 
                return message.channel.send("User is not in the database!")
            } else { 
                message.channel.send(`${nameofuser}'s current level is \`${results[0].level}\`.`)
            }
            
        })
    }
}