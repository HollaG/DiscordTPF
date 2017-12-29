const Table = require("cli-table2");

const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
const config = require("../configuration/config.json");
const connection = mysql.createConnection({
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,

    database: "suggestList",
    charset: "utf8"

})
const suggestedChannel = "395524726719643648"

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.makeRequest = (client, message, suggestion) => {
    var requesteeID;
    var requesteeName;
    if (message.mentions.users.size === 0 && message.mentions.roles.size === 0) {
        return message.channel.send("You must mention a valid person")
    } else {
        if (message.mentions.users.size === 1) {
            requesteeID = message.mentions.users.first().id
            requesteeName = message.mentions.users.first().username
        }
        if (message.mentions.roles.size === 1) {
            requesteeID = message.mentions.roles.first().id
            requesteeName = message.mentions.roles.first().name
        }
    }

    msgToSend = `Suggestion by ${message.author.username} on ${new Date().toDateString()}: 
    \`\`\`${suggestion.slice(1).join(" ")}\`\`\`
    `
    var actualSugg = suggestion.slice(1).join(" ")
    console.log(actualSugg)
    try {
        connection.query(`INSERT INTO suggestions (userId, username, suggestion, requesteeID, requesteeName, state, accepter) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.author.id, message.author.username, actualSugg, requesteeID, requesteeName, "Pending", "Not accepted"], function (err, results) {
            console.log(results)
            connection.query(`SELECT * FROM suggestions WHERE ID = ${results[0].insertId}`, function (err, result) {
                message.reply(` your request has been recieved as \`\`\`${result[0].suggestion}\`\`\` The unique ID of this request is \`${result[0].ID}\`. You will be notified if ${requesteeName} accepts your request.`)

            })
        })
    } catch (e) {
        console.log("error")
    }
    client.channels.find("name", "suggestions").send(msgToSend)
}

exports.listRequest = (client, message, selector) => {
    // List, selector = pending, accepted, all
    // sender's requests
    if (selector === "pending" || selector === "accepted") {
        connection.query(`SELECT * FROM suggestions WHERE userId = ${message.author.id} AND state = '${capitalizeFirstLetter(selector)}' OR requesteeID = ${message.author.id} AND state = '${capitalizeFirstLetter(selector)}'`, function (err, results) {

            if (err) return console.log(err)
            if (results.length === 0) {
                return message.channel.send("No requests for or by you yet!")
            }
            numberOfRequests = results.length
            var table = new Table({
                head: ['ID', 'Requestor', "Requestee", "Request"],
                colWidths: [4, 20, 20, 87],
                style: {
                    head: [],
                    border: []
                },
                wordWrap: true
            });
            for (var i = 0; i < numberOfRequests; i++) {
                table.push(
                    [results[i].ID, results[i].username, results[i].requesteeName, results[i].suggestion]
                )
            }
            message.channel.send(table.toString(), { code: "", split: true }, )
        })
    }
    if (selector === "all") {
        connection.query(`SELECT * FROM suggestions WHERE userId = ${message.author.id} OR requesteeID = ${message.author.id}`, function (err, results) {
            if (err) return console.log(err)
            if (results.length === 0) {
                return message.channel.send("No requests for or by you yet!")
            }
            numberOfRequests = results.length
            var table = new Table({
                head: ['ID', 'Requestor', "Requestee", "Request", "Status", "Accepter"],
                colWidths: [4, 17, 17, 71, 10, 10],
                style: {
                    head: [],
                    border: []
                },
                wordWrap: true
            });
            for (var i = 0; i < numberOfRequests; i++) {
                table.push(
                    [results[i].ID, results[i].username, results[i].requesteeName, results[i].suggestion, results[i].state, results[i].accepter]
                )
            }
            message.channel.send(table.toString(), { code: "", split: true }, )

        })
    }
}

exports.acceptRequest = (client, message, args) => {
    console.log(args)
    function myFunc(number) {
        connection.query(`SELECT * FROM suggestions WHERE ID = ?`, [number], (err, results) => {
            try {
                if (client.users.get(results[0].requesteeID)) {
                    // This ID is a user
                    if (results[0].requesteeID !== message.author.id) {
                        message.channel.send(`You cannot accept ${results[0].username}'s request for ${results[0].requesteeName} because you are not ${results[0].requesteeName}!`)
                    } else {
                        update(results)
                    }
                    console.log("user")
                } else {
                    if (message.member.roles.has(results[0].requesteeID)) {
                        console.log("hasrole")
                        update(results)
                    } else {
                        console.log("doesn't have role")
                        return message.channel.send(`You are not allowed to accept this request as you do not have the role '${results[0].requesteeName}'`)
                    }
                }
            } catch (e) {
                message.channel.send("Check syntax again! All IDs MUST be valid!")
            }


        })

        function update(results) {
            connection.query(`UPDATE suggestions SET state = 'Accepted', accepter = ? WHERE ID = ?`, [message.author.username, number], (err, result) => {
                message.channel.send(`Successfully accepted ${results[0].username}'s request: \`\`\`${results[0].suggestion}\`\`\``)
                message.channel.send(`<@${results[0].userId}>, your request was accepted by ${results[0].requesteeName}!`)
            })
        }
    }
    args.forEach(myFunc)
}

exports.rejectRequest = (client, message, args, reasons) => {
console.log(reasons)
    connection.query(`SELECT * FROM suggestions WHERE ID = ?`, [args], (err, results) => {
        try {
            if (message.author.id === results[0].userId) {
                reject(results)
            } else if (client.users.get(results[0].requesteeID)) {
                // This ID is a user
                if (results[0].requesteeID !== message.author.id) {
                    message.channel.send(`You cannot reject ${results[0].username}'s request for ${results[0].requesteeName} because you are not ${results[0].requesteeName}!`)
                } else {
                    reject(results)
                }
                console.log("user")
            } else {
                if (message.member.roles.has(results[0].requesteeID)) {
                    console.log("hasrole")
                    reject(results)
                } else {
                    console.log("doesn't have role")
                    return message.channel.send(`You are not allowed to reject this request as you do not have the role '${results[0].requesteeName}'`)
                }
            }
            function reject(results) {
                connection.query(`DELETE FROM suggestions WHERE ID = ?`, [args], (err, result) => {
                    message.channel.send(`Successfully rejected ${results[0].username}'s request for ${results[0].requesteeName}.`)
                    message.channel.send(`<@${results[0].userId}>, your request was rejected with the reason: \`\`\` ${reasons} \`\`\``)
                })

            }
        } catch (e) {
            message.channel.send("Check syntax again! A valid ID and a reason MUST be provided in order!")
        }
    })


}


