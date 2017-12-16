// server, profile command

const sql = require("sqlite");
sql.open("./scoring/scores.sqlite");

const mysql = require("mysql");
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: "root",
     
    database: "scores"

})
const config = require("../configuration/config.json");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.server = (message) => {
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

}

module.exports.profile = (message) => {
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
    
    var youtube;
    var steam; 
    var twitch;
    connection.query('SELECT * FROM links WHERE userId = ?', [personid], function(err, results, fields) {         
        youtube = results[0].youtube
        steam = results[0].steam
        twitch = results[0].twitch
    })
    var points;
    var level;
    connection.query('SELECT * FROM points WHERE userId = ?', [personid], function (err, results, fields) { 
        points = results[0].points
        level = results[0].level
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