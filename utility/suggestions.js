const Table = require("cli-table2");
const request = require("snekfetch");
const mysql = require("mysql");
const tokenId = require("../configuration/tokenId.json");
const config = require("../configuration/config.json");
//const custFunc = require("./custom-functions.js")
// var connection = mysql.createConnection({
//     host: tokenId.host,
//     user: "holla",
//     password: tokenId.pass,

//     database: "suggestList",
//     charset: "utf8"

// })
var db_config = {
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,

    database: "suggestList",
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
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

const suggestedChannel = "395524726719643648"

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.makeRequest = async (client, message, suggestion) => {
    var removedMention = suggestion.slice(1)
    const shortenURL = (i) => {
        return request.post(
            `https://www.googleapis.com/urlshortener/v1/url?key=${tokenId.googleKey}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { "longUrl": `${arrMatch[i]}` }
            }
        ).then(res => {
            return res.body.id
        }).catch(e => {
            message.channel.send(`Uh oh! An unexpected error occurred: \`\`\`${e}\`\`\``)
        })
    }
    
    var str = removedMention.join(" ")
    var arrMatch = str.match(/(((https?|ftp|file):\/\/|www\.|ftp\.)(\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$]))/gi)
    if (arrMatch) {
        for (let i = 0; i < arrMatch.length; i++) {
            var newURL = await shortenURL(i)
            str = str.replace(arrMatch[i], newURL)
        }
    }
    var arrReplacedURL = str.split(" ")
    if (message.attachments.find("message", message)) {
        console.log("this is running")
        console.log(message.attachments.find("message", message).url)
        await request.post(
            `https://www.googleapis.com/urlshortener/v1/url?key=${tokenId.googleKey}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { "longUrl": `${message.attachments.find("message", message).url}` }
            }
        )
            .then(res => {
                console.log(res.body.id)
                arrReplacedURL.push(`\nAttachments:\n${res.body.id}`)
                
            })
            .catch(e => console.log(e))
    }
    var suggURL = arrReplacedURL.join(" ")
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
    \`\`\`${suggURL}\`\`\`
    `
    var actualSugg = suggURL
    //console.log(actualSugg)
    try {

        connection.query(`INSERT INTO suggestions (userId, username, suggestion, requesteeID, requesteeName, state, accepter, accepterID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [message.author.id, message.author.username, actualSugg, requesteeID, requesteeName, "Pending", "Not accepted", "Not accepted"], function (err, results) {
            //console.log(results)
            if (err) throw err
            connection.query(`SELECT * FROM suggestions WHERE ID = ${results.insertId}`, function (err, result) {
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
    if (selector === "both" || selector === "everything") {
        var sql;

        selector === "both" ? sql = `SELECT * FROM suggestions WHERE userId = ${message.author.id} OR requesteeID = ${message.author.id}` : sql = `SELECT * FROM suggestions`


        connection.query(sql, function (err, results) {
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
    console.log(isNaN(Number(selector)))
    if (!isNaN(Number(selector))) {




        connection.query(`SELECT * FROM suggestions WHERE ID = ?`, [selector], (err, results) => {

            if (err) return console.log(err)
            if (results.length === 0) {
                return message.channel.send("No request matching that ID!")
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

            table.push(
                [results[0].ID, results[0].username, results[0].requesteeName, results[0].suggestion, results[0].state, results[0].accepter]
            )

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
            connection.query(`UPDATE suggestions SET state = 'Accepted', accepter = ?, accepterID = ? WHERE ID = ?`, [message.author.username, message.author.id, number], (err, result) => {
                message.channel.send(`Successfully accepted ${results[0].username}'s request: \`\`\`${results[0].suggestion}\`\`\``)                
                message.guild.members.get(results[0].userId).send(`${results[0].username}, your request \`\`\`${results[0].suggestion}\`\`\` was accepted by ${message.author.username} on ${new Date().toString()}!`)
            })
        }
    }
    args.forEach(myFunc)
}

exports.rejectRequest = (client, message, args, reasons) => {
    console.log(reasons)
    connection.query(`SELECT * FROM suggestions WHERE ID = ?`, [args], (err, results) => {
        try {

            if (results[0].state === "Accepted") {
                return message.channel.send(`You cannot reject this request: \`\`\`${results[0].suggestion}\`\`\` because it has already been accepted!`)
            } else if (message.author.id === results[0].userId) {
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
                    message.guild.members.get(results[0].userId).send(`${results[0].username}, your request \`\`\`${results[0].suggestion}\`\`\` was rejected by ${message.author.username} on ${new Date().toString()} with reason \`\`\`${reasons}\`\`\``)
                })

            }
        } catch (e) {
            message.channel.send("Check syntax again! A valid ID and a reason MUST be provided in order!")
        }
    })
}

exports.completeRequest = async (client, message, args, reasons) => {
    await connection.query(`SELECT * FROM suggestions WHERE ID = ?`, [args], (err, results) => {
        try {

            if (results[0].state === "Pending") {
                return message.channel.send(`You cannot complete this request: \`\`\`${results[0].suggestion}\`\`\` because it has not yet been accepted!`)
            } else if (client.users.get(results[0].requesteeID)) {
                // This ID is a user
                if (results[0].requesteeID !== message.author.id) {
                    message.channel.send(`You cannot complete ${results[0].username}'s request for ${results[0].requesteeName} because you are not ${results[0].requesteeName}!`)
                } else {
                    complete(results)
                }
                console.log("user")
            } else {
                // the requesteeID is a role
                console.log("is role")
                if (message.author.id === results[0].accepterID) {
                    console.log("hasrole")
                    complete(results)
                } else {
                    if (message.member.roles.has(results[0].requesteeID)) { 
                        return message.channel.send(`You are not allowed to complete this request as you did not accept this request!`)

                    } else { 
                        message.channel.send(`You are not allowed to complete this request as you do not have the role ${results[0].requesteeName}`)
                    }
                    console.log("doesn't have role")
                    
                }
            }
            function complete(results) {
                connection.query(`DELETE FROM suggestions WHERE ID = ?`, [args], (err, result) => {
                    message.channel.send(`Successfully completed ${results[0].username}'s request for ${results[0].requesteeName}.`)
                    message.guild.members.get(results[0].userId).send(`${results[0].username}, your request \`\`\`${results[0].suggestion}\`\`\` was completed by ${message.author.username} on ${new Date().toString()}!`)
                })

            }
        } catch (e) {
            message.channel.send("Check syntax again! A valid ID MUST be provided!")
            console.log(e)
        }


    })

}

exports.clearRequests = async (client, message, sentence) => { 
    var str = sentence.toString()
    const arrSql = ["SELECT", "*", "FROM", "suggestions"]
    const ending = ["WHERE", "state", "=", "Pending"]
    var tempArr;
    var sqlstr;
    if (str.includes("all")) {               
        sqlstr = `DELETE FROM suggestions WHERE requesteeID = ${message.author.id} AND state = "Pending" OR userId = ${message.author.id} AND state = "Pending"`
    }
    if (str.includes("me")) { 
        // select * from suggestions WHERE requesteeID = ${message.author.id}}
        sqlstr = `DELETE FROM suggestions WHERE requesteeID = ${message.author.id} AND state = "Pending"`
    }
    if (str.includes("others")) { 
       sqlstr = `DELETE FROM suggestions WHERE userId = ${message.author.id} AND state = "Pending"`
    }   
    connection.query(sqlstr, (err, results, fields) => {       
        message.channel.send(`Successfully cleared ${results.changedRows} requests.`)        
    })
}

