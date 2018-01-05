const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const request = require("snekfetch")
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
        await connection.query(`CREATE TABLE IF NOT EXISTS tempUsersTable (uID int AUTO_INCREMENT, creatorID VARCHAR(255), creatorName VARCHAR(255), PRIMARY KEY (uID)) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
        await connection.query(`DROP TABLE IF EXISTS users`)
        await connection.query(`CREATE TABLE IF NOT EXISTS users
        (
            creatorID varchar(50) NOT NULL,
            creatorName varchar(255)
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
        console.log(numberOfPagesToSearch) // 21
        for (let i = 1; i < numberOfPagesToSearch + 1; i++) {
            var results = await request.get(`https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${tokenId.key}&page=${i}&numperpage=100&creator_appid=446800&return_metadata=1`)

            //console.log(results.body.response.publishedfiledetails.length)
            for (let o = 0; o < results.body.response.publishedfiledetails.length; o++) {
                var steamID;
                results.body.response.publishedfiledetails[o].creator ? steamID = results.body.response.publishedfiledetails[o].creator : steamID = "76561198050511739" // if undefined for whatever reason set it to my profile
                // console.log(`STEAM ID IS ${steamID}`) 
                // console.log(await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=2C65774268CAE6E6D6DDC489A435E5C2&steamids=${steamID}`).then(creatorNames => creatorNames.body.response.players[0].personaname))

                var fileID = results.body.response.publishedfiledetails[o].publishedfileid
                var iterator = ((i - 1) * 100 + o)
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
                console.log(iterator)
                await connection.query(`INSERT INTO tempWorkshop SET ?`, tempObj)
            }
            steamIDs = new Set(steamIDs)
            steamIDs = Array.from(steamIDs)
            // console.log(steamIDs)    
            // console.log(steamIDs.length, "length")     
            

            var steamUsers = await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${tokenId.key}&steamids=${steamIDs.join()}`)
             
            for (let k = 0; k < steamIDs.length; k++) { 
                try { 
                    
                    
                    await connection.query(`INSERT INTO tempUsersTable (creatorID, creatorName) VALUES (?, ?)`,[steamUsers.body.response.players[k].steamid ,steamUsers.body.response.players[k].personaname])
                    console.log(k, "k")

                } catch (e) { 
                    console.log(e)
                }
                


            }
        
            console.log(steamIDs.length, "steamID.length")




            steamIDs = []





            //------------------------





            // var temporary;
            // for (let j = 0; j < Object.keys(results.body.response.publishedfiledetails).length; j++) {
            //     if (results.body.response.publishedfiledetails[j].creator !== "undefined") {



            //     }
            //     // steamIDs.push(results.body.)


            //     steamIDs.push(results.body.response.publishedfiledetails[j].creator || "test")
            //     temp.push(results.body.response.publishedfiledetails[j].creator || "test")

            // }

            // //var creatorNames = await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=2C65774268CAE6E6D6DDC489A435E5C2&steamids=${temp.join()}`)
            // for (let k = 0; k < temp.length; k++) {
            //     //obj[results.body.response.publishedfiledetails[k].creator] = creatorNames.body.response.players[k].personaname
            //     //obj[(i-1)+k] = 

            //     var fileID = results.body.response.publishedfiledetails[k].publishedfileid
            //     var tempObj = {
            //         filename: results.body.response.publishedfiledetails[k].title,
            //         creatorID: results.body.response.publishedfiledetails[k].creator,
            //         creatorName: await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=2C65774268CAE6E6D6DDC489A435E5C2&steamids=${temp.join()}`).then(creatorNames => creatorNames.body.response.players[k].personaname)
            //     }
            //     obj[(i-1)+k] = { 
            //         [fileID] : tempObj
            //     }

            //     //console.log(await request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=2C65774268CAE6E6D6DDC489A435E5C2&steamids=${temp.join()}`).then(creatorNames => creatorNames.body.response.players[k].personaname))












            //     /*
            //     obj = [
            //         {
            //             "test": {
            //                 "filename": "replaceme",
            //                 "creatorid": "replaceme",
            //                 "creatorname": "replaceme",
            //             }
            //         },
            //         {
            //             "test2": {
            //                 "filename": "replaceme",
            //                 "creatorid": "replaceme",
            //                 "creatorname": "replaceme",
            //             }
            //         }
            //     ]
            //     */
            //     //console.log(obj)
            //     //names.push(creatorNames.body.response.players[0].personaname)
            // }
            // //console.log(steamIDs.length)

            // //console.log(Object.keys(creatorNames.body.response.players[0]).length)




            //------------------------


            //console.log(i)





            temp = []
        }
        //console.log(names)

        // removes duplicates
        await connection.query(`INSERT INTO users (creatorID, creatorName)
            SELECT DISTINCT creatorID,creatorName
            FROM tempUsersTable`
        )
        console.log("done")

        //await connection.query(``)


        





    } catch (e) {
        console.log(e)
    }







}