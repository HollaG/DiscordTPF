// server, profile command
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
        console.log('db error in file about.js', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === "ECONNRESET") { 
            handleDisconnect()                        
        } else {                                     
            throw err;                                  
        }
    });
}
handleDisconnect()
const config = require("../configuration/config.json");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.server = (message) => {
    var totalMembers = (message.guild.memberCount + " members")
    var allchannellist = message.guild.channels.cache
    var DateofCreation = new Date(message.guild.createdAt).toDateString()
    var GuildOwner = message.guild.owner.user.username
    var serverName = message.guild.name
    var serverIcon = message.guild.iconURL
    var serverName = message.guild.name
    var region = message.guild.region
    var roles = []
    var rolelist = Array.from(message.guild.roles.cache)
    rolelist.forEach(role => {
        
        
        roles.push(role[1])
    })
    var channelcount = Array.from(message.guild.channels.cache).length

    var txtChns = []
    var textChannel = allchannellist.filter(t => {
        if (t.type == "text") {
            txtChns.push(t)
        }
    }).toString()  
    var vchns = [] 
    var voiceChannel = allchannellist.filter(t => {
        if (t.type == "voice") {
            vchns.push(t)
        }
    }).toString()

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
                        "value": (roles),
                    },
                    {
                        "name": "Available text channels: ",
                        "value": (txtChns),
                    },
                    {
                        "name": "Available voice channels: ",
                        "value": (vchns),
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
    var person = message.mentions.users.size === 0 ? message.author.username : message.mentions.users.first().username
    var personid = message.mentions.users.size === 0 ? message.author.id : message.mentions.users.first().id
    var youtube;
    var steam;
    var twitch;

    connection.query('SELECT * FROM links WHERE userId = ?', [personid], function (err, results, fields) {
        if (err) message.channel.send(err, {code : ""})
        youtube = results[0].youtube
        steam = results[0].steam
        twitch = results[0].twitch
    })
    var points;
    var level;
    connection.query('SELECT * FROM points WHERE userId = ?', [personid], function (err, results, fields) {
        if (err) message.channel.send(err, {code : ""})
        points = results[0].points
        level = results[0].level
    })

    var role; var joinDate; var userIcon;
    if (message.mentions.users.size >= 1) {
        if (message.mentions.members.first().roles.highest.name == "@everyone") {
            role = "No role for this user!"
        } else {
            role = message.mentions.members.first().roles.highest.name
        }
        joinDate = new Date(message.mentions.members.first().joinedAt).toDateString()
        userIcon = message.mentions.users.first().displayAvatarURL

    } else {
        if (message.member.roles.highest.name == "@everyone") {
            role = "No role for this user!"
        } else {
            role = message.member.roles.highest.name
        }
        joinDate = new Date(message.member.joinedTimestamp).toDateString()
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