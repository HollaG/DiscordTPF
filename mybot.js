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
        console.log('db error', err);
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

const activeUser = "I am active!";
const ontime = require("ontime");


client.login(tokenId.token);

client.on("ready", () => {
    console.log("I am ready!");
    client.channels.find("name", "botstuff").send("Bot has restarted on " + new Date().toString())
    //client.user.setGame("transportfever.com");
    client.user.setPresence({
        game: {
            name: '!help || transportfever.com',
            type: 0
        }
    });
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

//restart after 1 day
setTimeout(function () {
    process.exit()
}, 86400000)

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
    cycle: '1T12:00:00',
}, function (ot, message) {
    console.log("running program");
    updateRole(message);
    ot.done();
    return
})

function updateRole(message) {
    client.channels.get(audit_log).send("Updating user roles for " + Month())
    client.channels.get(announcements).send("Active user roles have been updated for " + Month())
    console.log("updating role")
    let guild = client.guilds.find("name", "Transport Fever")
    var role = guild.roles.find("name", activeUser)
    if (!role) { console.log("role doesn't exist") } else { role.delete() }

    setTimeout(function () {
        guild.createRole({
            name: activeUser,
            color: "GOLD",
            hoist: true,
            position: 4,
        })
    }, 200)
    setTimeout(retrieveData, 2000)
    setTimeout(retrieveClear, 5000)



    //retrieve who is top
    function retrieveData() {
        connection.query("SELECT userId, username, points FROM points ORDER BY points DESC LIMIT 10", function (err, results) {


            for (var i = 0; i < 10; i++) {
                console.log(`${results[i].userId}`)
                let person = guild.members.get(results[i].userId)
                let points = results[i].points
                let NameOfUser = results[i].username
                if (typeof person === "undefined") {
                    client.channels.get(audit_log).send(NameOfUser + " is not in the guild, not updating. " + new Date().toString())
                } else {
                    //person is not undefined
                    var myRole = guild.roles.find("name", activeUser)
                    person.addRole(myRole).catch(console.error)
                    client.channels.get(announcements).send("User " + NameOfUser + " now has the role with " + points + " points!")
                }
                if (i === 9) {
                    client.channels.get(announcements).send("Roles have been updated on " + new Date().toString())
                }

            }

        })

    }
    //add new column   
    let table_name = Month() + "_" + Year()
    console.log(table_name)
    function retrieveClear() {
        connection.beginTransaction(function (err) {
            connection.query(`ALTER TABLE points ADD ${table_name} int`, function (err, results) {
                if (err) {
                    return connection.rollback(function () {
                        throw err + "adding column";
                    })
                }
                connection.query(`UPDATE points SET ${table_name} = points`, function (err, results) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err + "setting score";
                        })

                    }
                    connection.query(`UPDATE points SET points = 0, level = '0'`, function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            })
                        }
                    })
                })
            })
            commitSQL()


        })
    }






}



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
    var acceptedLinks = {
        "twitch": "twitch",
        "steam": "steam",
        "youtube": "youtube",
    }

    if (acceptedLinks[command]) {
        links.checkLinks(message, command)
    }

    if (message.mentions.everyone) {
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
        } else {
            if (args.length !== 2 && args.length !== 4 && !message.content.startsWith(config.prefix + "top")) {
                if (message.content.startsWith(config.prefix) && (message.author.id == config.ownerID)) {
                    message.reply("there is no such command. Type `!help` for list of commands.");

                } else {
                    message.reply("I ain't heard of such a thing in my life, dumbass. Perhaps `!help` will sort you out.")
                    //client.setTimeout(3000)
                    message.channel.send("Just kidding, no hard feelings :)")
                    //console.log("Not the owner")
                }
            }
        }
        switch (command) {
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
                    page = Number(args[0])
                    if (isNaN(page)) { // if page is not a number
                        date = String(args[0]).toLowerCase()
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
            case "request":
                suggestions.makeRequest(client, message, args)
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
                let selector = args[0].toLocaleLowerCase()                                
                suggestions.listRequest(client, message, selector)
                break;
            case "complete":
                suggestions.completeRequest(client, message, args[0], args.splice(1).join(" "))
                break;
            case "clear": 
                if (args.length === 0) { 
                    return message.channel.send(`Please specify what you want to clear! Either list IDs of the requests, or [all], or [pending]`)
                }
                suggestions.clearRequests(client, message, args)
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
        if (wordResponse[responses]) {
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
    member.guild.defaultChannel.send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`);
    //client.channels.get(general).send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`)
});

// Member leave console message
client.on("guildMemberRemove", (member) => {
    console.log(`${member.user.username} has left TFDiscord`);

})

client.on("error", error => {
    console.log(error)
})
