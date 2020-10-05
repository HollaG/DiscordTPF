

// !top command
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
        console.log('db error in file positions.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect()
        } else {
            throw err;
        }
    });
}
handleDisconnect()
// connection.on('error', function (err) {
//     console.log(err.code)
//     connection.query('SELECT 1')
// })

module.exports.capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.getTop = (message, page, date) => {
    console.log(page + " page")
    console.log(date + " date")
    var monthNames = {

        "jan": "January",
        "feb": "February",
        "mar": "March",
        "apr": "April",
        "may": "May",
        "jun": "June",
        "jul": "July",
        "aug": "August",
        "sep": "September",
        "oct": "October",
        "nov": "November",
        "dec": "December"
    }
    var arrDate; var monthShortForm
    if (!date) {  // if date is undefined,
        console.log("running")
        date = date
    } else {
        if (date != "all") {
            arrDate = date.split("_") // nov, 2017
            monthShortForm = arrDate[0]
            if (monthNames[monthShortForm]) {
                arrDate.shift() // [2017]        
                arrDate.unshift("_") // [_, 2017]        
                arrDate.unshift(monthNames[monthShortForm]) // [November,_ , 2017]        
                date = arrDate.join("")
            } else { // if its not part of the accepted dates, send this
                message.channel.send(`\`${date}\` is not a valid date! Please follow this format: !top [Month(shortform, 3 letters)_Year]. Example: \`!top nov_2017\`. \nFor more information, see \`!help top\``)
                return date = undefined // set to undefined, return
            }
        } else {
            date = "total"
        }
    }

    var pointValue = "points"
    if (date) { // if date is defined
        pointValue = this.capitalizeFirstLetter(date)
    }
    if (date == "total") pointValue = "total"
    
    console.log(pointValue)

    var reactedUser = message.author.id
    var arr = []
    var i = 0 // first user
    var j = 10 // last user
    var k = 0 // placeholder for errors
    if (page) { // if page is specified, multiply i and j 
        j = page * 10
        i = page * 10 - 10
    }
    var lessThanTen = 0 // to check how many times the for loop runs. Used if it is less than 10    
    var numberOfUsers = 0 // check total number of users
    var deleteTime = 30000 // Time before ending the interactive scoreboard
    var userPoints = 0 // points of message sender
    connection.beginTransaction(function (err) {
        if (err) {
            return console.log(err)
        } else {
            connection.query('SELECT ?? FROM points WHERE userId = ?', [pointValue, message.author.id], function (err, result) {
                if (!result[0]) {
                    return message.channel.send("No such period exists in the database!", { code: "" })
                }
                userPoints = result[0][pointValue]
            })
            connection.query('SELECT username, ?? FROM points ORDER BY ?? DESC', [pointValue, pointValue], function (error, results, fields) {
                numberOfUsers = results.length

                var totalPages = Math.ceil(numberOfUsers / 10)
                if (page > totalPages) {
                    return message.reply(`please enter a valid page number between \`1\` and \`${totalPages}\``)
                }

                async function sendTop(message) {
                    arr = []
                    for (i; i < j; i++) {
                        // this code wouldn't run if there was no error.
                        // error referring to results[i] not defined => exceeded number of results            
                        k = 0
                        if (!results[i]) {
                            console.log(numberOfUsers + " Total users")

                            if (i < 0) {
                                console.log("here")
                                console.log("i = " + i + " Encountered lessThanTen people in the list")
                                console.log("j = " + j + " Encountered lessThanTen people in the list")
                                i = i + 10
                                j = j + 10
                                k = 1
                                return message.channel.send("No more users!").then(message => message.delete(1000))
                            } else {
                                console.log("else triggered")

                                // lessThanTen = 6, i = 180, j = 190                                               
                                // j = i 
                                i = i - lessThanTen // resets the value of i to before the "for" loop since the "for" loop incremented i by lessThanTen             

                                if (j / 10 > totalPages) {
                                    k = 1 // prevent further code from running, change i and j back to normal since there are no more pages
                                    j = j - 10
                                    i = i - 10
                                } else k = 0
                                // Insert array values here
                                arr.push("-------------------------------------------------------")
                                arr.push(`Your points: ${userPoints}`)
                                arr.push("-------------------------------------------------------")
                                arr.push("Page " + j / 10 + " of " + Math.ceil(numberOfUsers / 10) + " || " + `Column: ${pointValue}` + " || Total recorded users: " + numberOfUsers)
                                console.log(arr)
                            }
                            return
                            break;
                        }
                        lessThanTen++
                        // k here is used as a placeholder to check if there is an error. k = 1 when error, k = 0 when no error
                        let NameOfUser = results[i].username
                        let points = results[i][pointValue]
                        if (results[i].userId === message.author.id) {

                        }
                        arr.push(`${i + 1}` + "." + " " + NameOfUser + " with " + points + " points.")

                    } // this for loop sets the value of i to j (i++)
                    i = i - 10 // resets back
                    // Insert array values here
                    arr.push("-------------------------------------------------------")
                    arr.push(`Your points: ${userPoints}`)
                    arr.push("-------------------------------------------------------")
                    arr.push("Page " + j / 10 + " of " + Math.ceil(numberOfUsers / 10) + " || " + `Column: ${pointValue}` + " || Total recorded users: " + numberOfUsers)
                }
                sendTop(message)
                arr.join("\n")
                message.channel.send(arr, { code: "xl" }).then(message => {
                    ; (async () => {
                        var deleteMe = await message.channel.send("Click the emojis by the next 30 seconds to go to the next page!")
                        await message.react("⏮")
                        await message.react("◀")
                        await message.react("⏹")
                        await message.react("▶")
                        await message.react("⏭")

                        setTimeout(function () {
                            collector.on("collect", r => {
                                r.users.remove(reactedUser)
                                lessThanTen = 0
                                console.log("triggered")
                                if (r.emoji.name === "◀") { //left arrow, go back
                                    arr = []

                                    i = i - 10
                                    j = j - 10

                                    console.log("i = " + i + " normal code running")
                                    console.log("j = " + j + " normal code running")
                                    sendTop(message)
                                    if (k === 0) {
                                        message.edit(arr, { code: "xl" })
                                    } else return //r.remove(reactedUser)

                                }
                                if (r.emoji.name === "▶") {
                                    arr = []

                                    i = i + 10 // 180 + 10
                                    j = j + 10 // 190 + 10 
                                    // i = 190, j - 200
                                    console.log("i = " + i + " normal code running")
                                    console.log("j = " + j + " normal code running")
                                    sendTop(message)

                                    if (k === 0) {
                                        message.edit(arr, { code: "xl" })
                                    } else {
                                        return message.channel.send("No more members!").then(message => message.delete(1000))
                                    }
                                }
                                if (r.emoji.name === "⏹") {
                                    collector.stop()
                                    console.log("here")
                                    message.reactions.removeAll()

                                }
                                if (r.emoji.name === "⏮") {
                                    arr = []
                                    i = 0
                                    j = 10
                                    sendTop(message)
                                    if (k === 0) {
                                        message.edit(arr, { code: "xl" })
                                    }

                                }
                                if (r.emoji.name === "⏭") {
                                    arr = []
                                    // If the number of users is not a multiple of 10, i.e. lessThanTen
                                    j = Math.ceil(numberOfUsers / 10) * 10
                                    i = j - 10
                                    sendTop(message)
                                    console.log(i, "i")
                                    console.log(j, "j")
                                    if (k === 0) {
                                        message.edit(arr, { code: "xl" })
                                    }

                                }

                                console.log(`collected ${r.emoji.name}`)

                            })
                        }, 1000)
                        const collector = message.createReactionCollector(
                            (reaction, user) => reaction.emoji.name === "◀" || "▶" || "⏹" || "⏮" || "⏭",
                            { time: deleteTime }
                        )
                        collector.on("end", collected => {
                            try {
                                console.log(`collection ended`)
                                deleteMe.edit("Interactive scoreboard ended.")
                                message.reactions.removeAll()

                            } catch (e) {
                                console.log(e)
                            }

                        })

                    })();

                })

            })
        }
    })

}