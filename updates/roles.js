
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

exports.addRole = (client, r, user) => {
    var guild = client.guilds.find("name", "Transport Fever")
    var channel = guild.channels.find("name", "welcome")
    var reactor = guild.members.get(user.id)
    var role;
    switch (r.emoji.name) {
        case "1⃣":   //TpF player
            role = guild.roles.find("name", "TpF Player")
            try {
                if (!reactor.roles.has(role.id)) {
                    reactor.addRole(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;
        case "2⃣":   // CS player
            role = guild.roles.find("name", "C:S Player")
            try {
                if (!reactor.roles.has(role.id)) {
                    reactor.addRole(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "3⃣":     // Fact Player
            role = guild.roles.find("name", "Factorio Player")
            try {
                if (!reactor.roles.has(role.id)) {
                    reactor.addRole(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "4⃣": // Wantabe modder
            role = guild.roles.find("name", "Wantabe Modder")
            try {
                if (!reactor.roles.has(role.id)) {
                    reactor.addRole(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;
    }

}

exports.removeRole = (client, r, user) => {
    var guild = client.guilds.find("name", "Transport Fever")
    var channel = guild.channels.find("name", "welcome")
    var reactor = guild.members.get(user.id)
    var role;
    switch (r.emoji.name) {

        case "1⃣":
            role = guild.roles.find("name", "TpF Player")
            try {
                if (reactor.roles.has(role.id)) {
                    reactor.removeRole(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;
        case "2⃣":
            role = guild.roles.find("name", "C:S Player")
            try {
                if (reactor.roles.has(role.id)) {
                    reactor.removeRole(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "3⃣":
            role = guild.roles.find("name", "Factorio Player")
            try {
                if (reactor.roles.has(role.id)) {
                    reactor.removeRole(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "4⃣":
            role = guild.roles.find("name", "Wantabe Modder")
            try {
                if (reactor.roles.has(role.id)) {
                    reactor.removeRole(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

    }

}