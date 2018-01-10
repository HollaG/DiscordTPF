

const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const request = require("snekfetch")

async function getFileDetails(message, results, fileDetail, rawSearch) {
    // fileDetail is basisically the array of the details of the files

    console.log(results.body.response.players[0].personaname)
    var title = fileDetail.title + "\n"
    var linkToWebsite = "http://steamcommunity.com/sharedfiles/filedetails/?id=" + fileDetail.publishedfileid
    var fileSize = "Approximately " + (fileDetail.file_size / 1000000).toFixed(2) + "MB"
    var image = fileDetail.preview_url
    function replacer(match, p1, p2, p3, string) {
        return p3
    }
    var cleaned = "```" + fileDetail.short_description.trim().replace(/\[(\w+)(?:='(.*)')?\](.*)\[\/\1\]/g, replacer).replace(/\[(\w+)(?:='(.*)')?\](.*)\[\/\1\]/g, replacer) + "..." + "```"
    var fileDesc = cleaned + `\nRead more at [the mod's workshop page](${linkToWebsite})` // .replace(/[[hburlui/123456]789]/igm , " " ) 
    var dependencies = []
    var noOfDeps;
    // get any dependencies required
    if (fileDetail.num_children !== 0) {
        console.log("here")
        noOfDeps = fileDetail.num_children
            ; (async () => {
                for (var j = 0; j < noOfDeps; j++) {
                    var res = await request.post(
                        'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            data: `itemcount=1&publishedfileids[0]=${fileDetail.children[j].publishedfileid}`
                        }
                    )
                    var creator = await request.get(
                        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${tokenId.key}&format=json&steamids=${res.body.response.publishedfiledetails[0].creator}`
                    )
                    dependencies.push(`[${res.body.response.publishedfiledetails[0].title} by ${creator.body.response.players[0].personaname}](http://steamcommunity.com/sharedfiles/filedetails/?id=${res.body.response.publishedfiledetails[0].publishedfileid})`)
                    console.log(creator.body.response.players[0].personaname)
                }
            })();
    } else {
        dependencies.push("No dependencies!")
        noOfDeps = 0
    }
    var creator = `[${results.body.response.players[0].personaname}](${results.body.response.players[0].profileurl})`
    console.log(creator)
    var subs = fileDetail.subscriptions
    var views = fileDetail.views
    var votes = (fileDetail.vote_data.score * 100).toPrecision(3) + "%"
    console.log(votes)
    var fileImage = fileDetail.preview_url

    setTimeout(() => {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: `Search results for "${rawSearch}"`
                },
                image: {
                    url: fileImage
                },
                title: title,
                url: linkToWebsite,
                timestamp: new Date(),
                thumbnail: {
                    url: results.body.response.players[0].avatarfull
                },
                footer: {
                    icon_url: message.client.user.displayAvatarURL,
                    text: "Requested by " + message.author.username
                },
                fields: [
                    {
                        name: "Author",
                        value: creator

                    },
                    {
                        name: "**Item Description**",
                        value: fileDesc
                    },
                    {
                        name: "Total views",
                        value: views,
                        inline: true
                    },
                    {
                        name: "Total subscribers",
                        value: subs,
                        inline: true
                    },
                    {
                        name: "Rating",
                        value: votes,
                        inline: true
                    },
                    {
                        name: "File size",
                        value: fileSize,
                        inline: true
                    },
                    {
                        name: `Dependencies (${noOfDeps})`,
                        value: dependencies.join("\n")
                    }
                ]
            }
        }).then(msg => {
            msg.react("❓")
            const collector = msg.createReactionCollector(
                (reaction, user) => reaction.emoji.name === "❓" && user.id !== msg.author.id,
                { time: 10000 }
            )
            collector.on("collect", r => {
                console.log(`collected ${r.emoji.name}`)
                if (r.emoji.name === "❓") { }

            })

        }).catch(e => console.log(e))
    }, 1000)

}

exports.searchWorkshop = async (message, searchString, rawSearch, client) => {
    var searchTerms = searchString
    const header = "https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=" + tokenId.key + "&query_type=k_PublishedFileQueryType_RankedByTrend&page=1&numperpage=9&creator_appid=446800&child_publishedfileid=0&return_metadata=1&return_children=1&return_short_description=1&return_vote_data=1&search_text=" + searchString
    console.log(searchString)
    var arr = []
    request.get(header).then(result => {
        console.log((result.body.response.publishedfiledetails[0].title))
        var numberOfItems = Object.keys(result.body.response.publishedfiledetails).length
        try {
            for (var i = 0; i < numberOfItems; i++) {
                //console.log(i)
                arr.push(`${i + 1}. ${result.body.response.publishedfiledetails[i].title}`)
            }
        } catch (e) {
            console.log(e)
        } finally {
            message.channel.send(arr.join("\n"), { code: "" }).then((fMsg) => {
                message.channel.send("Select which mod you would like to view by typing in its number in the next 10 seconds.").then((msg) => {
                    message.channel.awaitMessages(response => response.content.length === 1, {
                        max: 1,
                        time: 10000,
                        errors: ['time']
                    }).then((collected) => {
                        collected.first().delete()
                        msg.delete()
                        fMsg.delete()
                        var number = collected.first().content - 1
                        var fileDetail = result.body.response.publishedfiledetails[number]
                        const creatorName = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${tokenId.key}&format=json&steamids=${fileDetail.creator}`
                        request.get(creatorName).then(results => {
                            try {
                                getFileDetails(message, results, fileDetail, rawSearch)
                            } catch (e) {
                                console.log(e)
                            }
                        })
                        console.log(collected.first().content)
                    }).catch(() => {
                        console.log("no msg")
                        msg.edit("No longer listening for messages.")
                    })
                })
            })
        }
    }).catch(e => {
        console.log(e)
        message.channel.send(`No results for ${rawSearch}`)
    })
}

const mysql = require("mysql");
var db_config = {
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,

    database: "workshop",
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
        console.log('db error in file workshop-items.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

exports.storeDB = async (client) => {

    try {
        var channel = client.channels.find("name", "botstuff")
        channel.send(`Updating local database, please stand by.`)

        var newRows;
        var editThis = await channel.send(`API query 0% done`, { code: "xl" })
        connection.query(`SELECT COUNT(*) as total FROM steam_workshop`, async (err, results) => {

            var oldRows = (results[0].total)

            console.log(oldRows)

            await connection.query(`DROP TABLE IF EXISTS tempWorkshop`)
            await connection.query(`CREATE TABLE IF NOT EXISTS tempWorkshop
            ( 
                ID int NOT NULL AUTO_INCREMENT,
                fileID varchar(50) NOT NULL,
                fileName varchar(255) NOT NULL,
                creatorID varchar(50) NOT NULL,          
                PRIMARY KEY (ID) 
            )
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            await connection.query(`DROP TABLE IF EXISTS tempUsersTable`)
            await connection.query(`CREATE TABLE IF NOT EXISTS tempUsersTable 
            (
                uID int AUTO_INCREMENT, 
                creatorID VARCHAR(255), 
                creatorName VARCHAR(255), 
                creatorURL VARCHAR(255),
                PRIMARY KEY (uID)
            ) 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            await connection.query(`DROP TABLE IF EXISTS users`)
            await connection.query(`CREATE TABLE IF NOT EXISTS users
            (
                creatorID varchar(50) NOT NULL,
                creatorName varchar(255),
                creatorURL varchar(255)
            )
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            await connection.query(`DROP TABLE IF EXISTS steam_workshop`)
            await connection.query(`CREATE TABLE IF NOT EXISTS steam_workshop
            ( 
                ID int NOT NULL AUTO_INCREMENT,
                fileID varchar(50) NOT NULL,
                fileName varchar(255) NOT NULL,
                creatorID varchar(50) NOT NULL,     
                creatorName varchar(255),   
                creatorURL varchar(255),  
                PRIMARY KEY (ID) 
            )
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            var obj = []
            var temp = []
            var steamIDs = []
            const errors = []
            const names = []
            var firstRes = await request.get(`https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${tokenId.key}&format=json&&creator_appid=446800&totalonly=1`)
            var totalItems = firstRes.body.response.total // 2020
            var numberOfPagesToSearch = Math.ceil(totalItems / 100)
            var iterator;
            for (let i = 1; i < numberOfPagesToSearch + 1; i++) {
                var results = await request.get(`https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${tokenId.key}&page=${i}&numperpage=100&creator_appid=446800&return_metadata=1`)

                for (let o = 0; o < results.body.response.publishedfiledetails.length; o++) {
                    var steamID;
                    results.body.response.publishedfiledetails[o].creator ? steamID = results.body.response.publishedfiledetails[o].creator : steamID = "76561198050511739" // if undefined for whatever reason set it to my profile

                    var fileID = results.body.response.publishedfiledetails[o].publishedfileid
                    iterator = ((i - 1) * 100 + o)
                    var tempObj = {
                        fileID: results.body.response.publishedfiledetails[o].publishedfileid || "nothing?",
                        fileName: results.body.response.publishedfiledetails[o].title || "nothing?",
                        creatorID: results.body.response.publishedfiledetails[o].creator || "76561198050511739"
                    }
                    var creatorID = results.body.response.publishedfiledetails[o].creator || "76561198050511739"
                    steamIDs.push(creatorID)

                    obj[(i - 1) + o] = {
                        [fileID]: tempObj
                    }
                    //console.log(iterator)
                    connection.query(`INSERT INTO tempWorkshop SET ?`, tempObj, function (err, results) {
                        if (results.insertId === Math.round(totalItems / 4)) {
                            console.log("HEREJKSRIJASEBJ")
                            editThis.edit(`Database 20% updated`, { code: "xl" })
                        }
                        if (results.insertId === Math.round(totalItems / 2)) {
                            editThis.edit(`Database 40% updated`, { code: "xl" })
                        }
                        if (results.insertId === Math.round(totalItems / 4) * 3) {
                            editThis.edit(`Database 60% updated`, { code: "xl" })
                        }
                        if (results.insertId === Math.round(totalItems - 1)) {
                            editThis.edit(`Database 80% updated`, { code: "xl" })
                        }

                    })
                }
                steamIDs = new Set(steamIDs)
                steamIDs = Array.from(steamIDs)

                var steamUsers = await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${tokenId.key}&steamids=${steamIDs.join()}`)

                for (let k = 0; k < steamIDs.length; k++) {
                    try {
                        await connection.query(`INSERT INTO tempUsersTable (creatorID, creatorName, creatorURL) VALUES (?, ?, ?)`, [steamUsers.body.response.players[k].steamid, steamUsers.body.response.players[k].personaname, steamUsers.body.response.players[k].avatarfull])
                        //console.log(k, "k")
                    } catch (e) {
                        console.log(e)
                    }

                }

                console.log(steamIDs.length, "steamID.length")

                steamIDs = []

                temp = []
                if (i === Math.floor((numberOfPagesToSearch + 1) / 4)) {
                    editThis.edit("API query 25% done", { code: "xl" })
                }
                if (i === Math.floor((numberOfPagesToSearch + 1) / 2)) {
                    editThis.edit("API query 50% done", { code: "xl" })
                }
                if (i === Math.floor((numberOfPagesToSearch + 1) / 4) * 3) {
                    editThis.edit("API query 75% done", { code: "xl" })
                }
                if (i === numberOfPagesToSearch) {
                    editThis.edit("API query 100% done", { code: "xl" })
                }
            }

            //console.log(names)

            // removes duplicates
            connection.query(`INSERT INTO users (creatorID, creatorName, creatorURL)
                SELECT DISTINCT creatorID,creatorName,creatorURL
                FROM tempUsersTable`
                , (err, results) => {
                    connection.query(`insert into steam_workshop
                select tempWorkshop.ID, tempWorkshop.fileID, tempWorkshop.fileName, tempWorkshop.creatorID, users.creatorName, users.creatorURL
                from tempWorkshop
                LEFT JOIN users ON tempWorkshop.creatorID = users.creatorID;`
                        , (err, results => {
                            editThis.edit(`Database 100% updated`, { code: "xl" })
                            var changed;
                            var word;
                            if (iterator > oldRows) {
                                changed = iterator - oldRows
                                word = "added"
                            } else if (iterator = oldRows) {
                                changed = 0
                                word = "updated"
                            } else if (iterator < oldRows) {
                                changed = oldRows - iterator
                                word = "removed"
                            }
                            channel.send(`Status\n----------------------\nRows ${word}: ${iterator - oldRows}\n----------------------`, { code: "xl" })
                        }))

                })
            console.log("done")


        })
    } catch (e) {
        console.log(e)
        channel.send(`Uh oh! Some sort of error has occurred!`)
    }

}

exports.searchUser = (client, message, searchStr) => {
    (async () => {
        console.log(searchStr, "searchStr")
        var searchText = `%${searchStr}%`
        var results = await connection.query(`SELECT * FROM steam_workshop WHERE creatorName LIKE ?`, [searchText], (err, results) => {
            if (err) throw err
            people = new Set()
            results.forEach((result) => {
                people.add(result.creatorName)
            })
            var moreThanOne_message;

            var retrieveSpecificInfo = async (sqlResult, webResult, selector, arrayOfResults, arrSelector) => {
                console.log("retrieveSpecificInfo running")
                try {
                    // Name of mod, Name of author (SQL) 
                    // Profile picture of author
                    // Short description (250, use substring)
                    // Link to mod workshop page
                    // Link to author
                    // Total views
                    // Total subs
                    // Rating, filesize, dependencies (unable to get!!!!)
                    // picture

                    var modName; var authorName; var fileImage; var authorPic; var linkMod; var linkAuthor; var short_description; var readMore; var totalViews; var totalSubs; var rating; var fileSize; var dependencies;
                    var getData = (sqlResult, webResult, selector) => {
                        var replacer = (match, p1, p2, p3, string) => p3;

                        modName = webResult[0].title;
                        authorName = sqlResult.creatorName;
                        fileImage = webResult[0].preview_url;
                        authorPic = sqlResult.creatorURL
                        linkMod = `http://steamcommunity.com/sharedfiles/filedetails/?id=${sqlResult.fileID}`
                        linkAuthor = `http://steamcommunity.com/profiles/${sqlResult.creatorID}`

                        let temp = webResult[0].description.trim().replace(/\[(\w+)(?:='(.*)')?\](.*)\[\/\1\]/g, replacer).replace(/\[(\w+)(?:='(.*)')?\](.*)\[\/\1\]/g, replacer)
                        short_description = "```" + temp.substring(0, Math.min(temp.length, 250)) + "..." + "```"

                        readMore = `\nRead more at [the mod's workshop page](${linkMod})`
                        totalViews = webResult[0].views
                        totalSubs = webResult[0].subscriptions
                        rating = `Currently this data set is not able to be retrieved by the current method :(`
                        fileSize = `This too :(`
                        dependencies = `Steam please :(`
                    }
                    getData(sqlResult, webResult)
                    function createEmbed() {
                        return embed = {
                            embed: {
                                color: 3447003,
                                author: {
                                    name: `Search results for users matching "${searchStr}"`
                                },
                                image: {
                                    url: fileImage
                                },
                                title: modName,
                                url: linkMod,
                                timestamp: new Date(),
                                thumbnail: {
                                    url: authorPic
                                },
                                footer: {
                                    icon_url: message.client.user.displayAvatarURL,
                                    text: "Requested by " + message.author.username
                                },
                                fields: [
                                    {
                                        name: "Author",
                                        value: `[${authorName}](${linkAuthor})`

                                    },
                                    {
                                        name: "**Item Description**",
                                        value: `${short_description} ${readMore}`
                                    },
                                    {
                                        name: "Total views",
                                        value: totalViews,
                                        inline: true
                                    },
                                    {
                                        name: "Total subscribers",
                                        value: totalSubs,
                                        inline: true
                                    },
                                    {
                                        name: "Rating",
                                        value: rating,
                                        inline: true
                                    },
                                    {
                                        name: "File size",
                                        value: fileSize,
                                        inline: true
                                    },
                                    {
                                        name: `Dependencies (*Info not available*)`,
                                        value: dependencies
                                    }
                                ]
                            }
                        }
                    }
                    message.channel.send(createEmbed()).then(msg => {
                        message.channel.send("Use the arrow emojis to navigate. You have 30 seconds until it will stop working.").then(infoM => {

                            console.log(selector)
                            if (selector === "true") { // more than 1 item 
                                ; (async () => {
                                    await msg.react("⏮")
                                    await msg.react("◀")
                                    await msg.react("⏹")
                                    await msg.react("▶")
                                    await msg.react("⏭")

                                    msg.react("◀").then(MessageReaction => msg.react("▶")) // maybe jump commands too?
                                    const collector = await msg.createReactionCollector(
                                        (reaction, user) => reaction.emoji.name === "◀" || "▶" || "⏮" || "⏭" || "⏹",
                                        { time: 30000 }
                                    );
                                    var thingToSelect = arrSelector
                                    setTimeout(() => {
                                        collector.on("collect", r => {
                                            r.remove(message.author.id)
                                            console.log("collected", r.emoji.name)
                                            if (r.emoji.name === "◀") {
                                                ; (async () => {

                                                    thingToSelect = thingToSelect - 1
                                                    if (thingToSelect < 0) {
                                                        message.channel.send("No more items!").then(m => m.delete(1000))
                                                        thingToSelect = thingToSelect + 1
                                                    } else {
                                                        var res = await request.post(
                                                            'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                                            {
                                                                headers: {
                                                                    'Content-Type': 'application/x-www-form-urlencoded'
                                                                },
                                                                data: `itemcount=1&publishedfileids[0]=${(arrayOfResults[thingToSelect]).fileID}`
                                                            }
                                                        )

                                                        console.log(thingToSelect, "thing to select")
                                                        getData(arrayOfResults[thingToSelect], res.body.response.publishedfiledetails)
                                                        msg.edit(createEmbed())
                                                    }

                                                })();

                                            }

                                            if (r.emoji.name === "▶") {
                                                // go forward 1 step
                                                // console.log(arrayOfResults, "array of results")
                                                // console.log(arrSelector, "array selector")

                                                ; (async () => {
                                                    console.log(arrayOfResults.length, "length")
                                                    thingToSelect = thingToSelect + 1
                                                    if (!arrayOfResults[thingToSelect]) {
                                                        message.channel.send("No more items!").then(m => m.delete(1000))
                                                        thingToSelect = thingToSelect - 1
                                                    } else {
                                                        var res = await request.post(
                                                            'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                                            {
                                                                headers: {
                                                                    'Content-Type': 'application/x-www-form-urlencoded'
                                                                },
                                                                data: `itemcount=1&publishedfileids[0]=${(arrayOfResults[thingToSelect]).fileID}`
                                                            }
                                                        )

                                                        console.log(thingToSelect, "thing to select")
                                                        getData(arrayOfResults[thingToSelect], res.body.response.publishedfiledetails)
                                                        msg.edit(createEmbed())
                                                    }

                                                })();
                                            }
                                            if (r.emoji.name === "⏮") {
                                                ; (async () => {

                                                    thingToSelect = 0
                                                    var res = await request.post(
                                                        'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                                        {
                                                            headers: {
                                                                'Content-Type': 'application/x-www-form-urlencoded'
                                                            },
                                                            data: `itemcount=1&publishedfileids[0]=${(arrayOfResults[thingToSelect]).fileID}`
                                                        }
                                                    )

                                                    console.log(thingToSelect, "thing to select")
                                                    getData(arrayOfResults[thingToSelect], res.body.response.publishedfiledetails)
                                                    msg.edit(createEmbed())
                                                })();
                                            }
                                            if (r.emoji.name === "⏭") {
                                                ; (async () => {

                                                    thingToSelect = (arrayOfResults.length - 1)
                                                    var res = await request.post(
                                                        'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                                        {
                                                            headers: {
                                                                'Content-Type': 'application/x-www-form-urlencoded'
                                                            },
                                                            data: `itemcount=1&publishedfileids[0]=${(arrayOfResults[thingToSelect]).fileID}`
                                                        }
                                                    )

                                                    console.log(thingToSelect, "thing to select")
                                                    getData(arrayOfResults[thingToSelect], res.body.response.publishedfiledetails)
                                                    msg.edit(createEmbed())
                                                })();
                                            }
                                            if (r.emoji.name === "⏹") {
                                                collector.stop()
                                            }

                                        })
                                        collector.on("end", collected => {
                                            infoM.edit("Emoji navigation is now disabled.")
                                            msg.clearReactions()

                                        })

                                    }, 1000)

                                })();

                            }

                        })

                    })

                } catch (e) {
                    console.log(e)

                } finally {
                    console.log("done")
                }

            }

            var retrieveInfo = async (ID) => {
                // ID is the creatorID
                // Purpose of this function is to retrieve all the mods and modnames of the specified creator
                try {
                    connection.query(`SELECT * FROM steam_workshop WHERE creatorID = ?`, [ID], (err, res) => {
                        var arr = Array.from(res)
                        var msgToSend = arr.map(item => {
                            return (arr.indexOf(item) + 1) + ". " + item.fileName
                        })

                        if (arr.length === 1) {
                            ; (async () => {
                                var res = await request.post(
                                    'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                    {
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        },
                                        data: `itemcount=1&publishedfileids[0]=${arr[0].fileID}`
                                    }
                                )
                                console.log(arr[0])
                                console.log(res.body.response.publishedfiledetails)
                                message.channel.send("This user has only published 1 item so far!")
                                retrieveSpecificInfo(arr[0], res.body.response.publishedfiledetails, "false")
                                console.log("only 1 item")
                            })();

                        } else {
                            message.channel.send(msgToSend.join("\n"), { code: "" }).then(msg => {
                                ; (async () => {
                                    var deleteMsg = await message.channel.send("Select which mod you would like to view by typing in its number in the next 10 seconds.")
                                    let collected = await message.channel.awaitMessages(response => response.content.length === 1, {
                                        max: 1,
                                        time: 10000,
                                        errors: ['time'],
                                    })
                                    collected.first().delete()
                                    msg.delete()
                                    deleteMsg.delete()
                                    if (arr[collected.first().content - 1]) {
                                        //console.log(arr[collected.first().content - 1], "HERE")
                                        var res = await request.post(
                                            'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
                                            {
                                                headers: {
                                                    'Content-Type': 'application/x-www-form-urlencoded'
                                                },
                                                data: `itemcount=1&publishedfileids[0]=${(arr[collected.first().content - 1]).fileID}`
                                            }
                                        )

                                        retrieveSpecificInfo(arr[collected.first().content - 1], res.body.response.publishedfiledetails, "true", arr, collected.first().content - 1)
                                        console.log("number was correct")

                                    } else {
                                        console.log("invalid number")
                                    }
                                })();
                            })
                        }
                        // if clause to check if there is only 1 item
                    })
                } catch (e) {
                    console.log(e)
                }
            }

                ; (async () => {
                    switch (people.size) {
                        case 1:
                            retrieveInfo(results[0].creatorID)
                            break;
                        case 0:
                            return message.channel.send(`No users matching ${searchStr} were found.`)
                            break;

                        default:
                            //console.log("ran")
                            var usersArray = Array.from(people)
                            var arr = usersArray.map(user => {
                                return (usersArray.indexOf(user) + 1) + ". " + user
                            })
                            moreThanOne_message = await message.channel.send(`More than one user was found matching the specified search terms. Please enter the number of the user in the next 10 seconds. \`\`\`${arr.join("\n")}\`\`\` `)
                            try {
                                var collected = await message.channel.awaitMessages(response => response.content.length === 1, {
                                    max: 1,
                                    time: 10000,
                                    errors: ['time'],
                                })
                                moreThanOne_message.delete()
                                collected.first().delete()
                                connection.query(`SELECT * FROM steam_workshop WHERE creatorName = ?`, [usersArray[collected.first().content - 1]], (err, results) => {
                                    console.log(results[0].creatorID)
                                    retrieveInfo(results[0].creatorID)
                                })

                            } catch (e) {
                                moreThanOne_message.edit("No longer listening for messages.")
                            }

                            break;

                    }

                })();

        })
    })();
}

process.on('unhandledRejection', error => {
    console.error(`Uncaught Promise Error: \n${error.stack}`);
});
