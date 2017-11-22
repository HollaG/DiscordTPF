const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./configuration/config.json");
const commands = require("./commands/commands.json");
const tokenId = require("./configuration/tokenId.json");
const fs = require("fs");
const sql = require("sqlite");
sql.open("./scoring/scores.sqlite");

var welcome = "246190912315719680" //TpF wlc channel
var announcements = "327046901520400404" // TpF annc channel
var general = "246190532949180417" // TpF general channel
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
    client.channels.get(testBotStuff).send("Bot has restarted on " + new Date().toString())
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

            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }
});

// Updating of scores
client.on("message", message => {

    if (new Date().getDate() == 1 || message.author.id == config.ownerID && message.content === "!updateRoles") {
        client.channels.get(audit_log).send("Updating user roles for " + Month())
        client.channels.get(announcements).send("Active user roles have been updated for " + Month())

        retrieveData()
        setTimeout(clearDatabase, 1000)

        function retrieveData() {
            sql.all(`SELECT userId, username, points FROM scores ORDER BY points DESC LIMIT 6`).then(rows => { // select each column
                //var firstP; var secondP; var thirdP; var fourthP; var fifthP
                var role = message.guild.roles.find("name", "This is a test role to check if my bot is working correctly")
                for (var i = 0; i < 6; i++) {
                    //console.log(`${rows[i].userId}`)
                    let person = message.guild.members.get(rows[i].userId)
                    let points = rows[i].points
                    let NameOfUser = rows[i].username
                    if (typeof person === "undefined") {
                        client.channels.get(audit_log).send(NameOfUser + " is not in the guild, not updating")
                    } else {
                        person.addRole(role).catch(console.error)
                        // console.log(typeof person)
                        client.channels.get(announcements).send("User " + NameOfUser + " now has the role with " + points + " points!")
                    }
                }
            })
        }

        //     /* 
        //         1. add columns total_score and date of year, check if exists, if already, do nothing
        //         2. set date of year to points
        //         3. Add points to total score 
        //         4. set points to zero
        //     */

        let table_name = Month() + "_" + Year() // add String() ? 
        console.log(table_name)
        function delRecords() { sql.run(`UPDATE scores SET points ='0', level = '0'`).catch((e) => console.log(e)) }
        function clearDatabase() {
            sql.run(`ALTER TABLE scores ADD COLUMN '${table_name}'`).then(() => { // Add New_Month column (delete this)
                sql.run(`UPDATE scores SET '${table_name}' = points`).then(() => delRecords())
            }).catch(e => console.log(e))
        }

    }
})

// Controls the updating of points
client.on("message", message => {


    if (message.content.startsWith(config.prefix) || message.channel.type === "dm") {
        return
    } else {

        sql.get(`SELECT * FROM scores WHERE userId ='${message.author.id}'`).then(row => {
            if (!row) {
                sql.run('INSERT INTO scores (userId, username, points, level) VALUES (?, ?, ?, ?)', [message.author.id, message.author.username, 1, 0]);
            } else {
                let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
                if (curLevel > row.level) {
                    row.level = curLevel;
                    sql.run(`UPDATE scores SET username = '${message.author.username}', points = '${row.points + 1}', level = '${row.level}' WHERE userId = '${message.author.id}'`);
                    message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
                }
                sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
            }
        }).catch(() => {
            console.error;
            sql.run('CREATE TABLE IF NOT EXISTS scores (userId TEXT, username TEXT, points INTEGER, level INTEGER)').then(() => {
                sql.run('INSERT INTO scores (userId, username, points, level) VALUES (?, ?, ?, ?)', [message.author.id, message.author.username, 1, 0]);
            });

        });
        sql.get(`SELECT * FROM links WHERE userId ='${message.author.id}'`).then(row => {
            if (!row) {
                sql.run('INSERT INTO links (userId, username, twitch, youtube, steam) VALUES (?, ?, ?, ?, ?)', [message.author.id, message.author.username, "`Nothing here :(`", "`Nothing here :(`", "`Nothing here :(`"]);
            } else {
                return
            }
        })
    }
})

// check message and level 
client.on("message", message => {
    var mclength = (message.content.split(' '))
    if (mclength.length === 2) return;

    if (message.content.startsWith(config.prefix + 'level')) {
        sql.get(`SELECT level FROM scores WHERE userId = '${message.author.id}'`).then(row => {
            if (!row) return message.reply("Your current level is 0");
            message.reply(`Your current level is \`${row.level}\`.`);
        });
    } else

        if (message.content.startsWith(config.prefix + "mcount")) {
            sql.get(`SELECT points FROM scores WHERE userId ='${message.author.id}'`).then(row => {
                if (!row) return message.reply("sadly you do not have any messages yet!");
                message.reply(`you have sent \`${row.points}\` messages to date.`);
            });
        }
});

// check message and level of others
client.on("message", (message) => {
    if (message.author.bot) return;
    var mclength = (message.content.split(' '))
    console.log(`${message.author.username}` + " has sent a message that is " + mclength.length + " words long.");
    if (mclength.length !== 2) return;
    if (!message.content.startsWith(config.prefix)) return
    else




        var nameofuser = (message.mentions.users.first());
    if (!message.mentions.users.first()) {
        return
    }
    var usernumber = (message.mentions.users.first().id);
    if (message.content.startsWith(config.prefix + "mcount")) {
        sql.get(`SELECT * FROM scores WHERE userId ="${usernumber}"`).then(row => {
            if (!row) return message.channel.send("Sadly no messages have been sent by them yet!");
            message.channel.send(`${nameofuser} has sent \`${row.points}\` messages to date.`);
        });

    }
    if (message.content.startsWith(config.prefix + 'level')) {
        sql.get(`SELECT level FROM scores WHERE userId = '${usernumber}'`).then(row => {
            if (!row) return message.reply("Your current level is 0");
            message.channel.send(`${nameofuser}'s current level is \`${row.level}\`. `);
        })
    };
});

// Command list and help section, uptime
client.on("message", (message) => {
    if (message.author.bot) return;
    var messageArray = (message.content.split(' '))

    //if (`${mclength.length} !== 1`); return;

    function help(args) {
        if (args == "profile") {
            message.channel.send("Here are the list of available commands relating to `profile` ```!stl : Set Twitch link. Usage: !stl (link) \n\n!syl : Set Youtube link. Usage: !syl (link) \n\n!ssl : Set Steam link. Usage : !ssl (link) \n\n!setlinks : Set all links in one message. Usage : !setlinks (Twitch) (Youtube) (Steam) \n\n!profile : View your profile!```")
        } else {
            message.channel.send("No such command, type `!help` for more information")
        }
    }


    if (!message.content.startsWith(config.prefix) || message.author.bot) return; //if message does not start with ! or is sent from a bot, return






    if (commands[message.content]) {
        message.channel.send(commands[message.content]).catch(() => {
        })
    } else {
        if (messageArray.length !== 2 && messageArray.length !== 4) {
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
    if (message.content.startsWith(config.prefix + "help")) {
        if (messageArray.length == 1) {
            message.channel.send(config.commandlist)
        }
        if (messageArray.length == 2) {
            help(messageArray[1])
        }
    }
    if (message.content.startsWith(config.prefix + "uptime")) {
        if (client.uptime / 60000 > 600) {
            message.channel.send(Math.round(client.uptime / 3600000) + " hours since restart")
        } else {
            message.channel.send(Math.round(client.uptime / 60000) + " minutes since restart")
        }
    }








});

// For actions that do not need config.prefix to function
client.on("message", (message) => {
    if (message.author.bot) return;

    let wordResponse = {
        "X.X": "Why that face?",
        ":frowning:": "Don't be sad...",
        "hi": "hello!",
        "Hi": "hello!",
        "bye": "Aww, goodbye :(",
        "gn": "Goodnight, " + `${message.author.username}` + "!",
        "thanks": "you're welcome :)",
        "what is the answer to the universe?": "42",
        "gm": "good morning!"
    }
    if (wordResponse[message.content]) {
        message.channel.send(wordResponse[message.content]);

    }

});

// !server command
client.on("message", (message) => {
    if (message.content == config.prefix + "server") {


        var totalMembers = (message.guild.memberCount + " members")
        var allchannellist = message.guild.channels
        var DateofCreation = new Date(message.guild.createdAt).toDateString()
        var GuildOwner = message.guild.owner.user.username
        var GuildDefaultChannel = message.guild.defaultChannel.name
        var serverIcon = message.guild.iconURL
        var serverName = message.guild.name
        var region = message.guild.region
        var rolelist = message.guild.roles.array().toString()
        var channelcount = message.guild.channels.array().length

        var textChannel = allchannellist.findAll("type", "text").toString()
        var voiceChannel = allchannellist.findAll("type", "voice").toString()



        function embed() {
            message.channel.send({
                "embed": {
                    "title": "Stats for " + (serverName),
                    // "description": ".",
                    "color": 149684,
                    "timestamp": (message.createdAt),
                    "footer": {
                        "icon_url": (message.author.username.avatarURL),
                        "text": "Requested by " + (message.author.username)
                    },
                    "thumbnail": {
                        "url": (serverIcon)
                    },
                    "author": {
                        "name": (serverName),
                        "url": "",
                        "icon_url": (serverIcon)
                    },
                    "fields": [
                        {
                            "name": "Server Owner",
                            "value": (GuildOwner),
                            "inline": true,
                        },
                        {
                            "name": "Server created on: ",
                            "value": (DateofCreation),
                            "inline": true,
                        },
                        {
                            "name": "Number of members: ",
                            "value": (totalMembers),
                            "inline": true,
                        },
                        {
                            "name": "Server region: ",
                            "value": (capitalizeFirstLetter(region)),
                            "inline": true,
                        },
                        {
                            "name": "List of roles: ",
                            "value": (rolelist),
                        },
                        {
                            "name": "Available text channels: ",
                            "value": (textChannel),
                        },
                        {
                            "name": "Available voice channels: ",
                            "value": (voiceChannel),
                        },
                        {
                            "name": "Total channel count: ",
                            "value": (channelcount),
                            "inline": true,
                        },

                    ]
                }
            }).catch((e) => {
                console.error(e)
            })

        }

        setTimeout(embed, 250);

        function test() {
            message.channel.send("testing")
        }
    }
})

// Member join welcome message
client.on("guildMemberAdd", (member) => {
    console.log(`${member.user.username} has joined TFDiscord`);
    member.guild.defaultChannel.send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`);
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

// !profile 
client.on("message", (message) => {
    if (message.content.startsWith(config.prefix + "profile")) {



        var mclength = (message.content.split(' '))




        let person;
        if (message.mentions.users.size >= 1) {
            person = message.mentions.users.first().username
        } else {
            person = message.author.username
        }
        let personid;
        if (message.mentions.users.size >= 1) {
            personid = message.mentions.users.first().id
        } else {
            personid = message.author.id
        }
        let points;
        sql.get(`SELECT * FROM scores WHERE userId = "${personid}"`).then(row => {
            points = row.points
        });
        let level;
        sql.get(`SELECT * FROM scores WHERE userId = "${personid}"`).then(row => {
            level = row.level
        })
        let youtube;
        sql.get(`SELECT * FROM links WHERE userId = "${personid}"`).then(row => {
            youtube = row.youtube
        })
        let steam;
        sql.get(`SELECT * FROM links WHERE userId = "${personid}"`).then(row => {
            steam = row.steam
        })
        let twitch;
        sql.get(`SELECT * FROM links WHERE userId = "${personid}"`).then(row => {
            twitch = row.twitch
        })
        //let rolearray = (message.guild.roles.get(personid))
        let role;
        if (message.mentions.users.size >= 1) {
            if (message.mentions.members.first().highestRole.name == "@everyone") {
                role = "No role for this user!"
            } else {
                role = message.mentions.members.first().highestRole.name
            }
        } else {
            if (message.member.highestRole.name == "@everyone") {
                role = "No role for this user!"
            } else {
                role = message.member.highestRole.name
            }
        }

        let joinDate;
        if (message.mentions.users.size >= 1) {
            joinDate = new Date(message.mentions.members.first().joinedAt).toDateString()
        } else {
            joinDate = new Date(message.member.joinedAt).toDateString()
        }
        let userIcon;
        if (message.mentions.users.size >= 1) {
            userIcon = message.mentions.users.first().displayAvatarURL
        } else {
            userIcon = message.client.user.displayAvatarURL
        }


        setTimeout(embedProfile, 150)
        function embedProfile() {
            message.channel.send({
                "embed": {

                    "description": "Customize your profile! To see how, type `!help profile`",

                    "color": 11161093,
                    "timestamp": (message.createdAt),
                    "footer": {
                        "text": "Requested by " + (message.author.username)
                    },
                    "thumbnail": {
                        "url": (userIcon)
                    },

                    "author": {
                        "name": (person) + "'s profile",
                        "icon_url": (userIcon)
                    },
                    "fields": [{
                        "name": "Sent messages",
                        "value": (points),
                        "inline": true
                    },
                    {
                        "name": "Current level",
                        "value": (level),
                        "inline": true
                    },
                    {
                        "name": "Current highest role, if any",
                        "value": (role),
                        "inline": true,
                    },
                    {
                        "name": "Join date",
                        "value": (joinDate),
                        "inline": true,
                    },
                    {
                        "name": (person) + "'s Youtube",
                        "value": (youtube)
                    },
                    {
                        "name": (person) + "'s Steam",
                        "value": (steam)

                    },
                    {
                        "name": (person) + "'s Twitch",
                        "value": (twitch),

                    }
                    ]
                }
            })
        }
    }
})