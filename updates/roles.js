
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
        console.log('db error in file roles.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

function Month() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var d = new Date()
    return monthNames[d.getMonth()]

}

function Year() {
    return new Date().getFullYear()
}

function DateInMonth() {
    return new Date().getDate()
}


exports.updateRoles = async (client) => {
    client.channels.find("name", "audit-log").send("Updating user roles for " + Month())
    client.channels.find("name", "announcements").send("Active user roles have been updated for " + Month())
    let guild = client.guilds.find("name", "BotTestServer") // Change this!
    var result;
    var test = await connection.query(`SELECT userId, username, points FROM points ORDER BY points DESC`)
    console.log(result)
    //console.log(users)









}
