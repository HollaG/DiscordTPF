




// !top command


const config = require("../configuration/config.json");

const mysql = require("mysql");
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: "root",
     
    database: "scores"

})


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
    }

    var pointValue = "points"
    if (date) { // if date is defined
        pointValue = this.capitalizeFirstLetter(date)
    }
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
    var deleteTime = 15000 // Time before ending the interactive scoreboard
    var userPoints = 0 // points of message sender
    connection.beginTransaction(function (err) {
        if (err) {
            return console.log(err)
        } else {
            connection.query('SELECT ?? FROM points WHERE userId = ?', [pointValue, message.author.id], function (err, result) {
                userPoints = result[0][pointValue]
            })
            connection.query('SELECT username, ?? FROM points ORDER BY ?? DESC', [pointValue, pointValue], function (error, results, fields) {
                numberOfUsers = results.length



                var totalPages = Math.ceil(numberOfUsers / 10)
                if (page > totalPages) {
                    return message.reply(`please enter a valid page number between \`1\` and \`${totalPages}\``)
                }

                function sendTop(message) {
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
                                //arr.push(`Your points: ${row[pointValue]}`)
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
                    message.react("◀").then(message.react("▶")).then(
                        setTimeout(function () {
                            message.clearReactions()
                        }, deleteTime)
                    )
                    message.channel.send("Click the emojis by the next 15 seconds to go to the next page!").then(message => {
                        setTimeout(function () {
                            message.edit("Interative scoreboard ended.")
                        }, deleteTime)
                    })

                    setTimeout(function () {
                        collector.on("collect", r => {
                            r.remove(reactedUser)
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
                            // if (r.emoji.name === "⏹") {
                            //     collector.stop()
                            //     console.log("here")
                            //     //message.edit("Interactive scoreboard ended.")
                            // }
                            console.log(`collected ${r.emoji.name}`)
                        })
                    }, 1500)
                    const collector = message.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === "◀" || "▶",
                        { time: deleteTime }
                    )

                    collector.on("end", collected => console.log(`collection ended`))
                })

            })
        }
    })



}