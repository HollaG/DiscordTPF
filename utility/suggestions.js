const Table = require("cli-table2");
const Discord = require("discord.js");
const request = require("snekfetch");
const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
const config = require("../configuration/config.json");
const color = require("randomcolor")

var db_config = {
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,

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
        console.log('db error in file suggestions.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();
(async () => {
    await connection.query(`CREATE DATABASE IF NOT EXISTS requests`)
    await connection.changeUser({ database: "requests" }, (err) => { if (err) throw err })
    await connection.query(`CREATE TABLE IF NOT EXISTS modRequests (
            ID int NOT NULL AUTO_INCREMENT,
            messageID TEXT,
            sender TEXT,
            senderID TEXT,
            content TEXT,
            acceptor TEXT,
            acceptorID TEXT,
            acceptorMessageID TEXT,
            date TEXT,
            date_raw TEXT, 
            attachments TEXT,
            completed_status TEXT,
            PRIMARY KEY (ID)           
        )`)

})();

const suggestedChannel = "395524726719643648"

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.acceptRequest = async (client, message, args) => {

    function shortenURL(i) {
        return new Promise((resolve, reject) => {
            request.post(
                `https://www.googleapis.com/urlshortener/v1/url?key=${tokenId.googleKey}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: { "longUrl": `${i}` }
                }
            ).then(res => {
                resolve(res.body.id)
            }).catch(e => {
                reject(e)
            })
        })
    }

    arrMsgs = []
    for (let e of args) {
        try {
            var m = await message.channel.fetchMessage(e)

        } catch (e) {
            return message.channel.send("- ERROR: Message ID is wrong! -", { code: "diff" }).then(m => m.delete(5000))
        }

        m.react("☑")
        var attachments = ""
        if (m.attachments.find("message", m)) {
            attachments = (m.attachments.find("message", m).url)

            attachments = await shortenURL(attachments)

        }
        var content = m.content
        var link = content.match(/(((https?|ftp|file):\/\/|www\.|ftp\.)(\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$]))/gi)
        // var mArray = m.split(" ")

        var shortenedLink = []
        function replaceLink(link) {
            return new Promise((resolve, reject) => {
                link.forEach(longLink => {

                    shortenURL(longLink).then(link => {
                        content = content.replace(longLink, link)
                        shortenedLink.push(link)
                    })

                })
                setTimeout(() => resolve(), 500)

            })

        }
        if (link) {
            await replaceLink(link)
        }

        var obj = {
            messageID: m.id,
            sender: m.author.username,
            senderID: m.author.id,
            content: content,
            acceptor: message.author.username,
            acceptorID: message.author.id,
            attachments: attachments || "",
            date: new Date().toDateString(),
            date_raw: new Date(),
            completed_status: "FALSE"
        }
        connection.query(`INSERT INTO modrequests SET ?`, obj, async (err, res, fields) => {
            console.log(res)
            const embed = new Discord.RichEmbed()
                .setTitle(`Accepted request by ${m.author.username}`)
                .setAuthor(message.author.username, message.author.displayAvatarURL)
                .setDescription(content)
                .setImage(attachments)
                .setColor(color())
                .setFooter(`ID: ${res.insertId}`)
                .setTimestamp()
            var channel = client.channels.find("name", "accepted-suggestions")
            var messageIDs = []

            var m1 = await channel.send(embed)

            messageIDs.push(m1.id)
            connection.query('UPDATE modrequests SET acceptorMessageID = ? WHERE ID = ?', [messageIDs.join(" "), res.insertId])

        })
    }    
}

exports.completeRequest = async (client, message, args) => {
    // args = [array of IDs]
    var cleaned = args.map(e => Number(e))
    message.delete(2000)
    if (cleaned.some(m => isNaN(m))) {
        return message.channel.send("- Please input only NUMBERS! -", { code: "diff" }).then(msg => {
            msg.delete(2000)
        })

    }

    connection.query(`SELECT * FROM modrequests WHERE ID IN (${cleaned.join()}) AND acceptorID = '${message.author.id}'`, (err, res, fields) => {
        
        connection.query(`UPDATE modrequests SET completed_status = 'TRUE' WHERE ID IN (${cleaned.join()})`)
        var IDs = []
        res.forEach(element => {
            IDs.push(`${element.ID}`)

        })

        var difference = args.filter(e => !IDs.includes(e))

        if (difference.length == 1) {
            message.channel.send(`- The request ID ${difference.join(" ")} was not found in the database! -`, { code: "diff" }).then(m => m.delete(4000))
        } else if (difference.length > 1) {
            message.channel.send(`- The request IDs ${difference.join(" & ")} were not found in the database! -`, { code: "diff" }).then(m => m.delete(4000))
        }

        res.forEach(e => {
            message.channel.fetchMessage(e.acceptorMessageID).then(m => {
                m.delete()

                const embed = new Discord.RichEmbed()
                    .setTitle(`Accepted request by ${e.sender}`)
                    .setAuthor(e.acceptor, client.users.get(e.acceptorID).displayAvatarURL)
                    .setDescription(e.content)
                    .setImage(e.attachments)
                    .setColor(color())
                    .setFooter(`ID: ${e.ID}`)
                    .addField("Accepted date", new Date(m.embeds[0].message.createdTimestamp).toDateString())
                    .setTimestamp(new Date())
                client.channels.find("name", "suggestion-archive").send(embed)

            })
            message.channel.send(`Successfully completed ${e.sender}'s request of ID ${e.ID}.`, { code: "css" }).then(m => m.delete(3000))
            client.users.get(e.senderID).send(`Your request was completed by ${e.acceptor}!`, { code: "css" })

        })
    })      
}
exports.clearRequests = async (client, message) => {

    message.delete(2000)
    connection.query(`SELECT * FROM modrequests WHERE acceptorID = '${message.author.id}' AND completed_status = 'FALSE'`, (err, res, fields) => {
        if (err) console.log(err)

        if (res.length == 0) {
            message.channel.send("Nothing to clear!").then(m => m.delete(2000))
        } else {

            (async () => {
                var deleteThis = await message.channel.send("Deletion in progress...")
                for (var i = 0; i < res.length; i++) {
                    console.log(res[i])
                    message.channel.fetchMessage(res[i].acceptorMessageID).then(m => {
                        m.delete()
                    })
                    if (i == res.length - 1) {
                        deleteThis.delete()
                        message.channel.send(`Deletion complete. Deleted ${res.length} requests.`).then(m => m.delete(10000))

                    }
                }
            })();
        }
        connection.query(`DELETE FROM modrequests WHERE acceptorID = ${message.author.id} AND completed_status = 'FALSE'`, (error, res, fields) => {
            if (err) console.log(error)
        })
    })   
}
