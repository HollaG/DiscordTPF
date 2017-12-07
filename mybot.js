const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./configuration/config.json");
const commands = require("./commands/commands.json");
const tokenId = require("./configuration/tokenId.json");
const fs = require("fs");
const sql = require("sqlite");
sql.open("./scoring/scores.sqlite");
const activeUser = "I am active!";
const ontime = require("ontime");

//modules!
const leveling = require("./updates/points.js");
const roleUpdates = require("./updates/roles.js")
const getInfo = require("./information/about.js")

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

client.login(tokenId.token);

client.on("ready", () => {
    console.log("I am ready!");
    client.channels.get(/*botstuff*/testBotStuff).send("Bot has restarted on " + new Date().toString())
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

//eval 

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


//Updating of scores

ontime({
    cycle: ['4T13:00:00',]
}, function (ot, message) {
    console.log("running program");
    roleUpdates.updateRoleTestVersion(message);
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
    if (!message.content.startsWith(config.prefix) && message.channel.type !== "dm" && message.author.id !== "354834684234170378") {
        leveling.update(message) // this adds the points for each message     
    }
    if (message.content.startsWith(config.prefix)) {
        leveling.checkInfo(message) // this checks message count / level
    }
    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase()
    switch (command) {
        case "help":
            if (mclength.length == 1) {
                message.channel.send(config.commandlist, { code: ""} )
            }
            if (mclength.length == 2) {
                help(mclength[1])
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
            sql.all(`SELECT username, points FROM scores ORDER BY points DESC LIMIT 10`).then(rows => {
                for (var i = 0; i < 10; i++) {
                    let NameOfUser = rows[i].username
                    let points = rows[i].points
                    !message.channel.send(`${i + 1}` + "." + " " + NameOfUser + " with " + points + " points.")
                }
            })
            break;
    }

    function help(args) {
        if (args == "profile") {
            message.channel.send("Here are the list of available commands relating to `profile` ```!stl : Set Twitch link. Usage: !stl (link) \n\n!syl : Set Youtube link. Usage: !syl (link) \n\n!ssl : Set Steam link. Usage : !ssl (link) \n\n!setlinks : Set all links in one message. Usage : !setlinks (Twitch) (Youtube) (Steam) \n\n!profile : View your profile! \n\n!top: Check top 10 in the server.```")
        } else {
            message.channel.send("No such command, type `!help` for more information")
        }
    }
})

// Command list 
client.on("message", (message) => {
    if (message.author.bot) return;
    var mclength = (message.content.split(' '))
    //if (`${mclength.length} !== 1`); return;
    if (!message.content.startsWith(config.prefix) || message.author.bot) return; //if message does not start with ! or is sent from a bot, return
    if (commands[message.content]) {
        message.channel.send(commands[message.content]).catch(() => {
        })
    } else {
        if (mclength.length !== 2 && mclength.length !== 4) {
            if (message.content.startsWith(config.prefix) && (message.author.id == config.ownerID)) {
                message.reply("There is no such command. Type `!help` for list of commands.");

            } else {
                message.reply("I ain't heard of such a thing in my life, dumbass. Perhaps `!help` will sort you out.")
                //client.setTimeout(3000)
                message.channel.send("Just kidding, no hard feelings :)")
                //console.log("Not the owner")
            }
        }
    }
});

// For actions that do not need config.prefix to function
client.on("message", (message) => {
    if (message.author.bot) return;
    let args = message.content.split(" ").reverse().pop().toLocaleLowerCase()

    let wordResponse = {
        "X.X": "Why that face?",
        ":frowning:": "Don't be sad...",
        "hi": "hello!",
        "bye": "Aww, goodbye :(",
        "gn": "Goodnight, " + `${message.author.username}` + "!",
        "thanks": "you're welcome :)",
        "what is the answer to the universe?": "42",
        "gm": "good morning!"
    }
    if (wordResponse[args]) {
        message.channel.send(wordResponse[args]);

    }
    if (message.mentions.everyone) {
        message.channel.send("```Please do NOT use @everyone or @here!```")
    }
});

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

// !profile and related commands
client.on("message", (message) => {
    if (message.author.bot) {
        return;
    }

    var mclength = message.content.split(' ')
    switch (mclength.length) {
        case 1:
            switch (message.content) {
                case config.prefix + "twitch":
                    sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
                        if (!row) return message.channel.send("no twitch link set"); {
                            message.reply(` your link to Twitch is ${row.twitch}`)
                        };
                    });
                    break;
                case config.prefix + "youtube":
                    sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
                        if (!row) return message.channel.send("no youtube link set"); {
                            message.reply(` your link to your Youtube channel is ${row.youtube}`);
                        };
                    });
                    break;
                case config.prefix + "steam":
                    sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
                        if (!row) return message.channel.send("no steam link set"); {
                            message.reply(` your link to your Steam is ${row.steam}`);
                        };
                    });
                    break;



            }
        case 2:
            switch (mclength[0]) {
                case config.prefix + "stl":
                    sql.get(`SELECT * FROM links WHERE userId ='${message.author.id}'`).then(row => {
                        if (!row) {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, mclength[1], "set link", "set link"]);

                        } else {
                            sql.run(`UPDATE links SET username ='${message.author.username}', twitch ='${mclength[1]}' WHERE userId ='${message.author.id}'`);
                        }
                    }).catch(() => {
                        console.error;
                        console.log("no table found")
                        sql.run('CREATE TABLE IF NOT EXISTS links (userId TEXT, username TEXT, twitch TEXT, youtube TEXT, steam TEXT)').then(() => {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, mclength[1], "set link", "set link"]);
                        });
                    });
                    message.reply(" Twitch link has been set as " + `${mclength[1]}`)
                    break;
                case config.prefix + "syl":
                    sql.get(`SELECT * FROM links WHERE userId ='${message.author.id}'`).then(row => {
                        if (!row) {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, "set link", mclength[1], "set link"]);

                        } else {
                            sql.run(`UPDATE links SET username ='${message.author.username}', youtube ='${mclength[1]}' WHERE userId ='${message.author.id}'`);
                        }
                    }).catch(() => {
                        console.error;
                        console.log("no table found")
                        sql.run('CREATE TABLE IF NOT EXISTS links (userId TEXT, username TEXT, twitch TEXT, youtube TEXT, steam TEXT)').then(() => {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, "set link", mclength[1], "set link"]);
                        });
                    });
                    message.reply(" Youtube link has been set as " + `${mclength[1]}`)
                    break;
                case config.prefix + "ssl":
                    sql.get(`SELECT * FROM links WHERE userId ='${message.author.id}'`).then(row => {
                        if (!row) {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, "set link", "set link", mclength[1]]);

                        } else {
                            sql.run(`UPDATE links SET username ='${message.author.username}', steam ='${mclength[1]}' WHERE userId ='${message.author.id}'`);
                        }
                    }).catch(() => {
                        console.error;
                        console.log("no table found")
                        sql.run('CREATE TABLE IF NOT EXISTS links (userId TEXT, username TEXT, twitch TEXT, youtube TEXT, steam TEXT)').then(() => {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, "set link", "set link", mclength[1]]);
                        });
                    });
                    message.reply(" Steam link has been set as " + `${mclength[1]}`)
                    break;

            }
        case 4:
            switch (mclength[0]) {
                case config.prefix + "setlinks":
                    sql.get(`SELECT * FROM links WHERE userId ='${message.author.id}'`).then(row => {
                        if (!row) {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, mclength[1], mclength[2], mclength[3]]);

                        } else {
                            sql.run(`UPDATE links SET username ='${message.author.username}', twitch ='${mclength[1]}', youtube = '${mclength[2]}', steam = '${mclength[3]}' WHERE userId ='${message.author.id}'`);
                        }
                    }).catch(() => {
                        console.error;
                        console.log("no table found")
                        sql.run('CREATE TABLE IF NOT EXISTS links (userId TEXT, username TEXT, twitch TEXT, youtube TEXT, steam TEXT)').then(() => {
                            sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, mclength[1], mclength[2], mclength[3]]);
                        });
                    });
                    message.reply(" Twitch, Youtube and Steam links have been set as " + mclength[1] + ", " + mclength[2] + ", " + mclength[3] + ", respectively.")
                    break;
            }
            break;
    }
})

