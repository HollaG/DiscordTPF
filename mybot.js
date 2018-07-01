const Discord = require("discord.js");
const sql = require("sqlite")
sql.open("./scoring/scores.sqlite")
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client();

// required JSON files 
const config = require("./configuration/config.json");
const commands = require("./commands/commands.json");
const tokenId = require("./configuration/tokenId.json");
const wordResponse = require("./commands/wordResponse.json")
const secondaryHelp = require("./commands/help.json")

//modules!
const roleUpdates = require("./updates/roles.js");
const getInfo = require("./information/about.js");
const positions = require("./information/positions.js");
const pointsSQL = require("./updates/points-sql.js");
const conversion = require("./utility/conversion.js");
const links = require("./information/links.js");
const updateLinks = require("./updates/update-links.js")
const workshop = require("./information/workshop-items.js")
const suggestions = require("./utility/suggestions.js")
const updateRoles = require("./updates/roles.js")
const totalpoints = require("./utility/total-points.js")

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
        console.log('db error in file mybot.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

// setInterval(function () {
//     connection.query('SELECT 1');
// }, 5000);

var TpF = "246190532949180417"
var welcome = "246190912315719680" //TpF wlc channel
var announcements = "386091548388884480" // TpF annc channel
var general = "272094615434166272" // TpF general channel
var botstuff = "335767575973593099" // TpF botstuff channel 
var information = "```This bot is running on a modified version of York's code. See website for details.\nhttps://anidiots.guide/. \n\nSource code for this bot is available on Github at https://github.com/HollaG/DiscordTPF```"
var server = "335619483018461194"
var testBotStuff = "335619483018461194" // testserver 
var audit_log = "382371100690219028"
var BotStuff_audit = "382372304619044865"
var BotStuff_ann = "382372383421628417"
var addroleMsge = "426734189782630401"
var removeroleMsge = "426751840546324480"

const activeUser = "I am active!";
const ontime = require("ontime");

client.login(tokenId.token);

client.on("ready", async () => {
    console.log("I am ready!");
    client.channels.find("name", "botstuff").send("Bot has restarted on " + new Date().toString())
    //client.user.setGame("transportfever.com");
    client.user.setPresence({
        game: {
            name: '!help || transportfever.com',
            type: 0
        }
    });

    var msge = await client.channels.find("name", "welcome").fetchMessage(addroleMsge)
    var rmsge = await client.channels.find("name", "welcome").fetchMessage(removeroleMsge)
    await msge.react("1⃣")
    await msge.react("2⃣")
    await msge.react("3⃣")
    await msge.react("4⃣")
    await rmsge.react("1⃣")
    await rmsge.react("2⃣")
    await rmsge.react("3⃣")
    await rmsge.react("4⃣")

    // const collector = msg.createReactionCollector(
    //     (reaction, user) => reaction.emoji.name === "1⃣" || "2⃣" || "3⃣" || "4⃣"
    //     , { time: 10000000  })

    // collector.on('collect', r => {
    //     updateRoles.addRole(client, r)
    //     console.log(`collected ${r.emoji.name}`)
    //     console.log(r.users)
    //     //console.log(r.users.keyArray()[r.users.keyArray().size])

    // })

});

client.on("messageReactionAdd", (reaction, user) => {
    if (user.bot) return

    //msg.react("1⃣").then(msg.react("2⃣")).then(msg.react("3⃣")).then(msg.react("4⃣")).catch(e => console.log(e))

    if (reaction.message.id == addroleMsge) {
        console.log('yes')
        // console.log(reaction.emoji.name)
        updateRoles.addRole(client, reaction, user)

    } else if (reaction.message.id == removeroleMsge) {
        console.log('no')
        updateRoles.removeRole(client, reaction, user)
    }

    return
})

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

//restart after 1 day
//setTimeout(() => { process.exit() }, 86400000)

function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ignore() {
    if (message.channel.type === "dm") {
        return
    }
}

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

function commitSQL() {
    connection.commit(function (err) {
        if (err) {
            return connection.rollback(function () {
                return console.log(err);
            });
        }
    });
}

ontime({
    cycle: '1T20:00:00',
}, function (ot) {
    console.log("running program");
    try {
        updateRoles.activeOne(client);
    } catch (e) {
        client.channels.find("name", "botstuff").send(e)
    } finally {
        ot.done();
        return
    }

})

var doThis = (client) => {
    workshop.storeDB(client)
}

ontime({
    cycle: '12:00:00',
}, function (ot) {
    //console.log(client)    
    doThis(client)
    ot.done();
    return

})

// eval 
client.on("message", message => {
    const args = message.content.split(" ").slice(1);

    if (message.content.startsWith(config.prefix + "eval")) {
        if (message.author.id !== config.ownerID) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), { code: "xl", split: "true" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }
});

client.on("message", message => {
    var mclength = message.content.split(" ")
    console.log(`${message.author.username}` + " has sent a message that is " + mclength.length + " words long.");
    if (!message.content.startsWith(config.prefix) && message.channel.type !== "dm" && message.author.id !== "354834684234170378" && !message.author.bot) {
        pointsSQL.updatePoints(message) // this adds the points for each message     
    }
    //if (message.author.bot) return
    if (message.content.startsWith(config.prefix)) {
        pointsSQL.checkInformation(message) // this checks message count / level
    }
    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase()

    if (command === "test") {
        if (message.author.id !== config.ownerID) return; 
        updateRoles.activeOne(client)
    }
    if (command === "pull") {
        workshop.storeDB(client)
    }

    if (command === "searchuser") {
        var searchStr = args.join(" ")
        if (searchStr.length < 3) {
            return message.channel.send("Search terms must be more than 3 characters.")
        }
        workshop.searchUser(client, message, args.join(" "))

    }

    var acceptedLinks = {
        "twitch": "twitch",
        "steam": "steam",
        "youtube": "youtube",
    }

    if (acceptedLinks[command] && message.content.startsWith(config.prefix)) {
        links.checkLinks(message, command)
    }
    if (message.mentions.everyone && !message.member.roles.some(r => ["Game DeveloperZ", "AdminZ", "MoDerators"].includes(r.name))) {
        message.channel.send("```Please do NOT use @everyone or @here!```")
    }

    if (message.content === "!copyDB" && message.author.id === config.ownerID) {
        var numberOfUsers_scores = 0
        sql.all(`SELECT * FROM scores`).then((row) => {
            while (row[numberOfUsers_scores]) {
                numberOfUsers_scores++
                console.log(numberOfUsers_scores)
            }
            setTimeout(function () {
                for (var i = 0; i < numberOfUsers_scores; i++) {
                    connection.query('INSERT INTO points VALUES (?, ?, ?, ?, ?, ?)', [row[i].userId, row[i].username, row[i].points, row[i].level, row[i].November_2017, row[i].December_2017])
                }
            }, 4000)
        })
        var numberOfUsers_links = 0
        sql.all(`SELECT * FROM links`).then((rows) => {
            while (rows[numberOfUsers_links]) {
                numberOfUsers_links++
                console.log(numberOfUsers_links)
            }
            setTimeout(function () {
                for (var i = 0; i < numberOfUsers_links; i++) {
                    connection.query('INSERT INTO links VALUES (?, ?, ?, ?, ?)', [rows[i].userId, rows[i].username, rows[i].twitch, rows[i].youtube, rows[i].steam])
                }
            }, 4000)
        })
    }
    var selector;
    if (message.content.startsWith(config.prefix)) {
        if (commands[command]) {
            message.channel.send(commands[command]).catch(() => {
            })
            // } else {
            //     if (args.length !== 2 && args.length !== 4 && !message.content.startsWith(config.prefix + "top")) {
            //         if (message.content.startsWith(config.prefix) && (message.author.id == config.ownerID)) {
            //             message.reply("there is no such command. Type `!help` for list of commands.");

            //         } else {
            //             message.reply("I ain't heard of such a thing in my life, dumbass. Perhaps `!help` will sort you out.")
            //             //client.setTimeout(3000)
            //             message.channel.send("Just kidding, no hard feelings :)")
            //             //console.log("Not the owner")
            //         }
            //     }
        }
        switch (command) {
            case "score": 
                totalpoints.totalScore(client, message)
                break;

            case "help":
                if (args.length == 0) {
                    message.channel.send(config.commandlist, { code: "asciidoc" })
                } else if (args.length == 1) {
                    help(args[0].toLowerCase())
                } else {
                    message.channel.send(`No such command, type \`!help\` for more information`)
                }

                break;
            case "shutdown":
                process.exit()
                break;
            case "server":
                getInfo.server(message)
                break;
            case "profile":
                getInfo.profile(message)
                break;
            case "uptime":
                if (client.uptime / 60000 > 600) {
                    message.channel.send(Math.round(client.uptime / 3600000) + " hours since restart")
                } else {
                    message.channel.send(Math.round(client.uptime / 60000) + " minutes since restart")
                }
                break;
            case "top":
                var page; var date
                console.log(args.length)
                if (args.length === 1) {
                    if (args === "all") {                         
                        date = "all"
                    } else { 
                        page = Number(args[0])
                        if (isNaN(page)) { // if page is not a number
                            date = String(args[0]).toLowerCase()
                        }
                    }
                    
                }
                if (args.length === 2) {
                    page = Number(args[0])
                    if (isNaN(page)) {
                        date = String(args[0]).toLowerCase()
                        page = Number(args[1])
                    } else {
                        date = String(args[1]).toLowerCase()
                    }
                }
                positions.getTop(message, page, date)
                break;
            case "ping":
                message.channel.send(`Ping is \`${client.ping} ms\``)
                break;
            case "roll":
                message.channel.send(`You rolled a ${Math.round(Math.random() * 100)}!`)
                break;
            case "convert":
                if (!args || args.length !== 3) {
                    return message.channel.send("Please specify valid units and values!")
                } else {
                    conversion.convertUnits(message, args[0], args[1], args[2])
                }
                break;
            case "contype":
                if (!args || args.length !== 1) {
                    return message.channel.send("Specify only one unit to show possible types!")
                } else {
                    conversion.showTypes(message, args[0].toLowerCase())
                }
                break;
            case "search":
                workshop.searchWorkshop(message, args.join("+"), args.join(" "), client)
                break;
            case "ssl":
                if (!args || args.length !== 1) {
                    return message.channel.send("Please indicate the link to set! Make sure there are no spaces. Example: `https://steamcommunity.com/id/notarealuser`")
                } else {
                    selector = "steam"
                    updateLinks.updateLink(message, args, selector)
                    message.reply(` Steam link has been set as **${args}**`, { code: "" })
                }
                break;
            case "stl":
                if (!args || args.length !== 1) {
                    return message.channel.send("Please indicate the link to set! Make sure there are no spaces. Example: `https://twitch.tv/notarealuser`")
                } else {
                    selector = "twitch"
                    updateLinks.updateLink(message, args, selector)
                    message.reply(` Twitch link has been set as **${args}**`, { code: "" })
                }
                break;
            case "syl":
                if (!args || args.length !== 1) {
                    return message.channel.send("Please indicate the link to set! Make sure there are no spaces. Example: `https://youtube.com/channel/notarealuser`")
                } else {
                    selector = "youtube"
                    updateLinks.updateLink(message, args, selector)
                    message.reply(` Youtube link has been set as **${args}**`, { code: "" })
                }
                break;
            case "setlinks":
                if (!args || args.length !== 3) {
                    return message.channel.send("Please indicate the links to set! There must be 3 links in total. See `!help profile` for more information.")
                } else {
                    updateLinks.updateAll(message, args)
                    message.reply(`Twitch link has been set as **${args[0]}**\nYoutube link has been set as **${args[1]}**\nSteam link has been set as **${args[2]}**`, { code: "" })
                }
                break;
            
            case "accept":
                suggestions.acceptRequest(client, message, args)
                break;
            case "reject":
                suggestions.rejectRequest(client, message, args[0], args.splice(1).join(" "))
                break;
            case "list":
                if (args.length === 0) {
                    return message.channel.send("Please provide an argument, either 'all', 'pending' or 'accepted'.")
                }
                selector = args[0].toLocaleLowerCase()
                suggestions.listRequest(client, message, selector)
                break;
            case "complete":
                suggestions.completeRequest(client, message, args)
                break;
            case "clear":                
                suggestions.clearRequests(client, message)
                break;
            case "send":
                if (message.author.id !== config.ownerID) return
                message.delete()
                message.channel.send(args.join(" "))
                break;
        }

        function help(args) {
            if (secondaryHelp[args]) {
                message.channel.send((secondaryHelp[args]).join("\n"), { code: "" })

            } else {
                message.channel.send("No such command, type `!help` for more information")
            }
        }
    } else {
        let responses = message.content.split(" ").reverse().pop().toLocaleLowerCase()
        // check for id
        if (!message.mentions.users.first()) {
            return
        }
        if (wordResponse[responses] && message.mentions.users.first().id === client.user.id) {
            message.channel.send(wordResponse[responses])
        }

    }

})

// delete message spam prevention
client.on("messageDelete", (message) => {
    
    message.guild.channels.find("name", "audit-log").send(`A message whose content was \`${message.cleanContent}\` sent by \`${message.author.username}\` in <#${message.channel.id}> was deleted on \`${new Date().toString()}\` `)
})

// Member join welcome message
client.on("guildMemberAdd", (member) => {
    console.log(`${member.user.username} has joined TFDiscord`);
    client.channels.find("name", "general").send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`);
    //client.channels.get(general).send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`)
});

// Member leave console message
client.on("guildMemberRemove", (member) => {
    console.log(`${member.user.username} has left TFDiscord`);

})

client.on("error", error => {
    console.log(error)
})
