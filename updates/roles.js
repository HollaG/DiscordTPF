
const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const mysql = require("mysql");
var db_config = {
    host: tokenId.host,
    user: "tfbot",
    password: tokenId.pass,

    database: "scores",
    charset: "utf8"
}
/*
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
            handleDisconnect()
        } else {
            throw err;
        }
    });
}
handleDisconnect()
*/
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
    var guild = client.guilds.cache.get(mainServer)
    var channel = guild.channels.cache.find(c => c.name == "roles") // Update this 
    var reactor = guild.members.cache.get(user.id)
    var role;
    switch (r.emoji.name) {
        case "1⃣":   //TpF player
            role = guild.roles.cache,find(r => r.name == "TpF Player")
            try {
                if (!reactor.roles.cache.has(role.id)) {
                    reactor.roles.add(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;
        case "2⃣":   // CS player
            role = guild.roles.cache.find(role => role.name == "C:S Player")
            try {
                if (!reactor.roles.cache.has(role.id)) {
                    reactor.roles.add(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "3⃣":     // Fact Player
            role = guild.roles.cache.find(role => role.name == "Factorio Player")
            try {
                if (!reactor.roles.cache.has(role.id)) {
                    reactor.roles.add(role).catch(console.error)
                } else {
                    channel.send("You already have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "4⃣": // Wantabe modder
            role = guild.roles.cache.find(role => role.name == "Wantabe Modder")
            try {
                if (!reactor.roles.cache.has(role.id)) {
                    reactor.roles.add(role).catch(console.error)
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
    var guild = client.guilds.cache.get(mainServer)
    var channel = guild.channels.cache.find(channel => channel.name == "roles")
    var reactor = guild.members.cache.get(user.id)
    var role;
    switch (r.emoji.name) {

        case "1⃣":
            role = guild.roles.cache.find(role => role.name == "TpF Player")
            try {
                if (reactor.roles.cache.has(role.id)) {
                    reactor.roles.remove(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;
        case "2⃣":
            role = guild.roles.cache.find(role => role.name == "C:S Player")
            try {
                if (reactor.roles.cache.has(role.id)) {
                    reactor.roles.remove(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "3⃣":
            role = guild.roles.cache.find(role => role.name == "Factorio Player")
            try {
                if (reactor.roles.cache.has(role.id)) {
                    reactor.roles.remove(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

        case "4⃣":
            role = guild.roles.cache.find(role => role.name == "Wantabe Modder")
            try {
                if (reactor.roles.cache.has(role.id)) {
                    reactor.roles.remove(role).catch(console.error)
                } else {
                    channel.send("You don't have this role!").then(m => m.delete(1000))
                }
            } catch (e) {
                channel.send("Unexpected error occurred! Contact Holla").then(m => m.delete(1000))
            }
            break;

    }

}

exports.activeOne = async (client, mainServer) => {
    var connection = mysql.createConnection(db_config);

    var guild = client.guilds.cache.get(mainServer)
    var annchannel = client.channels.cache.find(c => c.name == "announcements")
    var auditlogchannel = client.channels.cache.find(c => c.name == "audit-log")

    var role = guild.roles.cache.find(r => r.name == "I am active!")

    // var res1 = await connection.query(`SELECT userId FROM points ORDER BY userId DESC LIMIT 10`)

    var deleted;

    if (role) { 
        deleted = await role.delete()
    }
    var tempVar = await auditlogchannel.send(`${deleted.name} role deleted`)

    var newRole = await guild.createRole({
        name: "I am active!",
        color: "GOLD",
        hoist: true,
        position: 4,
    })
    tempVar.edit("Role added")
    var notInGuild = ["People not in guild:"]
    var inGuild = ["---------------------"]
    connection.query(`SELECT userId, username, points FROM points ORDER BY points DESC LIMIT 10`, (err, res) => {
        // console.log(res) 
        // [ RowDataPacket { userId: '188192190705434624', username: 'Holla', points: 92 },
        // RowDataPacket { userId: '206405439422857217', username: 'Ebi', points: 3 },
        // RowDataPacket { userId: '330697266652250112', username: 'Surge', points: 3 } ]
        res.forEach(element => {
            // 1 Check if member is in the guild
            // 2 Stop if not, add if in
            let person = guild.members.cache.get(element.userId)
            if (!person) { 
                notInGuild.push(`${element.username}`)
            } else { 
                person.roles.add(newRole)
                inGuild.push(`${element.username} with ${element.points} points!`)
            }
        })
        auditlogchannel.send(notInGuild.join("\n"), { code : "" })
        inGuild.push("---------------------")
        annchannel.send(`These people have been given the role being active in ${Month()}!`)
        annchannel.send(inGuild.join("\n"), { code : "xl" })

        var columnName = Month() + "_" + Year() // April_2018
        try { 
            connection.query(`ALTER TABLE points ADD ${columnName} int`, (err, res) => { 
                if (err) auditlogchannel.send(err, { code : "" })
                connection.query(`UPDATE points SET ${columnName} = points`, (err, res) => {
                    if (err) auditlogchannel.send(err, { code : "" })
                    connection.query(`UPDATE points SET points = '0'`, (err, res) => {
                        auditlogchannel.send("Done!", { code : ""})
                    })
                })
    
            })
        } catch (e) { 
            auditlogchannel.send(e, {code : ""})
        }
        
    })

}
