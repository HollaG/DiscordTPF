const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
const config = require("../configuration/config.json");

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
        console.log('db error in file mybot.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

exports.totalScore = async (client, message) => {
    var validMonths = []
    connection.query(`SELECT DISTINCT table_name, column_name, column_type FROM information_schema.columns WHERE table_schema = "scores" AND column_type = "int(11)"`, (err, res) => {
        res.forEach(element => {
            validMonths.push(element.column_name)
        })
        console.log(validMonths) // [ 'December_2017', 'January_2018', 'April_2018' ]
        var totalPts = 0
        connection.query(`SELECT * FROM points WHERE userId = ${message.author.id}`, (err, res) => { 
            // console.log(res) 
                // [ RowDataPacket {
                // userId: '188192190705434624',
                // username: 'Holla',
                // points: 0,
                // level: 0,
                // November_2017: 1848,
                // December_2017: 0,
                // January_2018: 29,
                // April_2018: 0 } ]
            validMonths.forEach(element => { 
                totalPts = totalPts + res[0][element]
            })
            console.log(totalPts, "final")
            message.reply(` your total score from ${validMonths[1].split("_").join(" ")} to ${validMonths[validMonths.length - 1].split("_").join(" ")} is \`${totalPts}\`.`)
        })       
    })
}