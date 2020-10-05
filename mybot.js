const Discord = require("discord.js");
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client();

// required JSON files 
const config = require("./configuration/config.json");
const commands = require("./commands/commands.json");
const tokenId = require("./configuration/tokenId.json");
const wordResponse = require("./commands/wordResponse.json")
const secondaryHelp = require("./commands/help.json")

// utility modules
const auditLogs = require("./utility/audit-log")
const uptime = require("./utility/uptime")
const suggestions = require("./utility/suggestions.js")
const conversion = require("./utility/conversion.js");
const totalpoints = require("./utility/total-points.js")
const translate = require("./utility/translate")
const modTools = require("./utility/modtools.js")

// update modules
const roleUpdates = require("./updates/roles.js");
const pointsSQL = require("./updates/points-sql.js");
const updateLinks = require("./updates/update-links.js")
const updateRoles = require("./updates/roles.js")

// information modules
const getInfo = require("./information/about.js");
const positions = require("./information/positions.js");
const links = require("./information/links.js");
const workshop = require("./information/workshop-items.js");
const dailyInfo = require("./information/dailyinfo")

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
        console.log('db error in file mybot.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

var mainServer = "246190532949180417"

// swap the numbers as needed
// var TpF = "246190532949180417"
// var testBotStuff = "335619483018461194" // testserver 

/* Transport Fever Server IDs */ 
var welcome = "634725723751448576" //TpF wlc channel
var rules = "634007370770415616" //TpF rules channel
var roles = ""
var iAgree = "635334812239921162" // TpF agree channel
var announcements = "386091548388884480" // TpF annc channel
var general = "272094615434166272" // TpF general channel
var botstuff = "335767575973593099" // TpF botstuff channel 
/* -------------------------- */

var information = "```This bot is running on a modified version of York's code. See website for details.\nhttps://anidiots.guide/. \n\nSource code for this bot is available on Github at https://github.com/HollaG/DiscordTPF```"
var server = "335619483018461194"
var audit_log = "382371100690219028"
var BotStuff_audit = "382372304619044865"
var BotStuff_ann = "382372383421628417"
var addroleMsge = "426734189782630401"
var removeroleMsge = "426751840546324480"

const activeUser = "I am active!";
const ontime = require("ontime");

// custom functions 

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

client.login(tokenId.token);

client.on("ready", async() => {
    console.log("I am ready!");
    client.channels.cache.find(c => c.name == "botstuff").send("Bot has restarted on " + new Date().toString())
    //client.user.setGame("transportfever.com");
    client.user.setPresence({
        game: {
            name: '!help || transportfever.com',
            type: 0
        }
    });
    var rolesChannel = client.channels.cache.find(c => c.name == "welcome")
    await rolesChannel.messages.fetch(addroleMsge)
    await rolesChannel.messages.fetch(removeroleMsge)

});

client.on("messageReactionAdd", (reaction, user) => {

    if (user.bot) return  
    console.log("Here")
    if (reaction.message.id == addroleMsge) {
        console.log('yes')        
        updateRoles.addRole(client, reaction, user)

    } else if (reaction.message.id == removeroleMsge) {
        console.log('no')
        updateRoles.removeRole(client, reaction, user)
    }    
})

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

ontime({
    cycle: '1T20:00:00'
}, function (ot) {
    console.log("running program");
    try {
        updateRoles.activeOne(client, mainServer);
    } catch (e) {
        client.channels.cache.find(c => c.name =="botstuff").send(e)
    } finally {
        ot.done();
        return
    }

})

ontime({ 
    cycle: "0:01:00"
}, (ot) => { 
    dailyInfo.updateDaily(client, mainServer)
    ot.done()

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

// eval message code

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
    if (!message.content.startsWith(config.prefix) && message.channel.type !== "dm" && message.author.id !== "354834684234170378" && !message.author.bot && message.content.length > 16) {
        pointsSQL.updatePoints(message) // this adds the points for each message
        if (message.channel.name != "admin-talk") { 
            dailyInfo.logSpecificChannel(client, message, mainServer) 
            dailyInfo.logSpecificUser(client, message, mainServer) 
        }
        
    }
    //if (message.author.bot) return
    if (message.content.startsWith(config.prefix)) {
        pointsSQL.checkInformation(message) // this checks message count / level
    }
    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase()
   
    if (command === "test") {
        if (message.author.id !== config.ownerID) return;
        doThis(client)
        // updateRoles.activeOne(client)
        // message.guild.fetchMembers().then(res =>res.members.forEach(function(key, value) { 
        //     console.log(key, value)
        // }))
        // dailyInfo.updateDaily(client, mainServer)
        // if (args.length !== 1) return
        // modTools.fetchBans(client, mainServer, message, args)
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
    // deletes all unnecessary messages in the roles channel
    // if (message.channel.name == "agree" && message.content !== "!agree" && !message.author.bot) { 
    //     message.delete()
    // }

    if (acceptedLinks[command] && message.content.startsWith(config.prefix)) {
        links.checkLinks(message, command)
    }
    if (message.mentions.everyone && !message.member.roles.some(r => ["Game DeveloperZ", "AdminZ", "MoDerators"].includes(r.name))) {
        message.channel.send("```Please do NOT use @everyone or @here!```")
    }


    if (message.channel.name == "new-mods-releases" && message.content.match(`https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/`)) { // match this specific link
        workshop.automaticInfo(client, message, mainServer)

    }

    var selector;
    if (message.content.startsWith(config.prefix)) {
        

        if (commands[command] && commands[command].trim.length != 0) {
            // message reply array, see commands.json
            message.channel.send(commands[command]).catch(e => {})
        }

        // admin- and mod- specific commands 
        if (message.member.roles.cache.some(r => ["AdminZ", "MoDerators"].includes(r.name))) { 
            switch (command) { 
                case "delete":                     
                    modTools.purgeMessage(client, mainServer, message, args)    
                    break;

            }

        }
        
        // general commands
        
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
            case "uptime": // change this to miliseconds ltr REMEMBER process.uptime is in seconds
                uptime.checkUptime(client, message)
            
                // if (client.uptime / 60000 > 600) {
                //     message.channel.send(Math.round(client.uptime / 3600000) + " hours since restart")
                // } else {
                //     message.channel.send(Math.round(client.uptime / 60000) + " minutes since restart")
                // }
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
            case "translate":
                translate.breaker(client, message, args)
                break;
            case "agree":
                //try { 
                    var guild = client.guilds.cache.get(mainServer)
                    var unverified = guild.roles.cache.find(r => r.name == "Unverified") // Unverified role
                    var verified = guild.roles.cache.find(r => r.name == "Verified") // verified
                    console.log(Boolean(message.channel.name == "agree"))
                    if (message.channel.name == "agree" && message.member.roles.cache.get(unverified.id)) {                               
                        
                        // message.delete(1000)
                        message.reply("thank you for agreeing to the rules. The rest of the server will be unlocked. We hope you enjoy your stay.").then(m => { 
                            // m.delete(1000)    
                            message.member.roles.add(verified).catch(e => { 
                                message.reply("error adding. Something went wrong. Please ping @Holla.")
                                console.log(e)
                            })
                            setTimeout(function(){ 
                                message.member.roles.remove(unverified).catch(e => { 
                                    console.log(e)
                                    message.reply("error removing. Something went wrong. Please ping @Holla.")
                                })
                            }, 10000)
                            
                        })                  
                        
                    }
                        
                //} catch (e) { 
                //     message.reply("unexpected error, please contact @Holla")

                // }
                break;  
            case "daily":
                dailyInfo.checkYesterdayInfo(client, message, mainServer)
                break;
            case "say": 
                if (message.author.id !== config.ownerID) return
                message.channel.send(args.join(" "))
                message.delete()
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
    if (message.channel.name == "audit-log") { 
        return 
    } else { 
        auditLogs.auditMessageDelete(client, message)        
    }
    
})

// Member join welcome message
client.on("guildMemberAdd", (member) => {
    console.log(`${member.user.username} has joined TFDiscord`);
    client.channels.cache.find(c => c.name == "welcome").send(`Welcome ${member.user.username} to the server! Please read the rules in <#${rules}> and type !agree in <#${iAgree}> to agree!`);     
   
    var unverified = client.guilds.cache.get(mainServer).roles.cache.find(r => r.name == "Unverified") // Unverified role
    member.roles.add(unverified)   
    auditLogs.auditMemberJoin(client, member)

});

// Member leave console message
client.on("guildMemberRemove", (member) => {
    console.log(`${member.user.username} has left TFDiscord`);
    auditLogs.auditMemberLeave(client, member)
})

client.on("error", error => {
    console.log(error)
})
