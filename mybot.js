const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./configuration/config.json");
const fs = require("fs");
const sql = require("sqlite");
sql.open("./scoring/scores.sqlite");

var welcome = "246190912315719680" //TpF wlc channel
var announcements = "327046901520400404" // TpF annc channel
var general = "246190532949180417" // TpF general channel
var botstuff = "335767575973593099" // TpF botstuff channel
var information = "```This bot is running on a modified version of York's code. See website for details.\nhttps://anidiots.guide/. \n\nSource code for this bot is available on Github at https://github.com/HollaG/DiscordTPF```"

//var feedparser = require('ortoo-feedparser');

//var url = "https://www.reddit.com/r/TransportFever/new/.rss?sort=new";





client.login(config.token);


client.on("ready", () => {
  console.log("I am ready!");
  //client.user.setGame("transportfever.com");
  client.user.setPresence({ game: { name: 'transportfever.com', type: 0 } });
});


client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));




client.on("message", message => {

  if (message.content.startsWith(config.prefix + "new")) {
    feedparser.parseUrl(url).on('article', function (article) {
      console.log("title:", article.title);
      message.channel.send(article.title)
      console.log("new")

    })

  }
})

client.on("message", message => {

  //Controls the updating of points
  if (message.content.startsWith(config.prefix)) {
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
  }
})


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

client.on("message", (message) => {
  if (message.author.bot) return;
  var mclength = (message.content.split(' '))
  console.log(`${message.author.username}` + " has sent a message that is " + mclength.length + " words long.");
  if (mclength.length !== 2) return;
  if (!message.content.startsWith(config.prefix)) return
  else




    var nameofuser = (message.mentions.users.first());
  if (!message.mentions.users.first()) {
    return console.log("no one was mentioned")
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


// for actions that need config.prefix to function
client.on("message", (message) => {
  if (message.author.bot) return;
  var mclength = (message.content.split(' '))
  //if (`${mclength.length} !== 1`); return;
  if (mclength.length > 1) return;
  let responseObject = {
    "!ping": "pong!",
    "!foo": "bar",
    "X.X": "Why that face?"
  }
  let commands = {
    "!help": "```!ping \n\n!status \n\n!foo \n\n!help \n\n!twitch \n\n!youtube \n\n!steam \n\n!mcount : Check message count. \n\n!status \n\n!stl : Set Twitch link. Usage: !stl (link) \n\n!syl : Set Youtube link. Usage: !syl (link) \n\n!ssl : Set Steam link. Usage : !ssl (link) \n\n!setlinks : Set all links in one message. Usage : !setlinks (Twitch) (Youtube) (Steam) \n\n!profile : View your profile!```",
    "!addbot": "Test-adding...",
    "!ssl": " ",
    "!syl": " ",
    "!stl": " ",
    "!mcount": "Retrieving message count for " + `${message.author.username}` + "...",
    "!status": "If I didn't reply to you I wouldn't be online, now would I?",
    "!information": `${information}`,
    "!level": "Retrieving level count for " + `${message.author.username}` + "...",
  }
  let allowed = {
    "!twitch": " ",
    "!steam": " ",
    "!youtube": " ",
    "!profile": " "
  }
  if (!message.content.startsWith(config.prefix) || message.author.bot) return; //if message does not start with ! or is sent from a bot, return
  console.log('Message sent')

  if (responseObject[message.content] || commands[message.content] || allowed[message.content] || message.channel.id == `${general}`) {



    message.channel.send(responseObject[message.content]);







    //message.delete()
  } else {
    if (message.content.startsWith(config.prefix) && (message.author.id == config.ownerID)) {
      message.reply("There is no such command. Type `!help` for list of commands.");

    } else {
      message.reply("I ain't heard of such a thing in my life, dumbass. Perhaps `!help` will sort you out.")
      //client.setTimeout(3000)
      message.channel.send("Just kidding, no hard feelings :)")
      //console.log("Not the owner")
    }

  }

  if (commands[message.content]) {
    message.channel.send(commands[message.content]);
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
    "what is the answer to the universe?": "42"
  }
  if (wordResponse[message.content]) {
    message.channel.send(wordResponse[message.content]);
    //console.log(`${message.author.username}`)
  }

});


client.on("message", (message) => {
  // Set the prefix
  /*  let prefix = "!";
  */
  // Exit and stop if it's not there
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  if (message.content == (config.prefix + "addbot")) {
    client.emit("guildMemberAdd", message.member);
  }

});


client.on("guildMemberAdd", (member) => {
  console.log(`${member.user.username} has joined TFDiscord`);
  member.guild.defaultChannel.send(`Welcome ${member.user.username} to the server! Please read the rules in <#${welcome}>!`);
});

client.on("guildMemberRemove", (member) => {
  console.log(`${member.user.username} has left TFDiscord`);

})


client.on("message", (message) => {
  if (message.author.bot) {
    return;
  }
  if (message.content.startsWith(config.prefix)) {
    var mclength = (message.content.split(' '))

  } else {
    return
  }
  if (mclength.length < 2) {
    if (message.content == (config.prefix + "twitch")) {
      sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) return message.channel.send("no twitch link set"); {
          message.reply(` your link to Twitch is ${row.twitch}`);
          console.log("logging twitch link")
        }
      })
    }
    if (message.content == (config.prefix + "youtube")) {
      sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) return message.channel.send("no youtube link set"); {
          message.reply(` your link to your Youtube channel is ${row.youtube}`);
        };
      });
    }
    if (message.content == (config.prefix + "steam")) {
      sql.get(`SELECT * FROM links WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) return message.channel.send("no steam link set"); {
          message.reply(` your link to your Steam is ${row.steam}`);
        };
      });
    }
    return
  } else {

    if (message.content.startsWith(config.prefix + "stl")) {
      console.log("setting twitch link")
      console.log(`${mclength[1]}`)
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
    }

    if (message.content.startsWith(config.prefix + "syl")) {
      console.log("setting youtube link")
      console.log(`${mclength[1]}`)
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
    }

    if (message.content.startsWith(config.prefix + "ssl")) {
      console.log("setting steam link")
      console.log(`${mclength[1]}`)
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
    }

    if (mclength.length === 4) {
      if (message.content.startsWith(config.prefix + "setlinks"))

        console.log("setting all links")
      console.log(`${mclength[1]}, ${mclength[2]}, ${mclength[3]}`)
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
    } else {
      return
    }
  };
})
/*

client.on("message", (message) => { 
  if (message.content.startsWith(config.prefix + "remindMe")) { 
    var remind = message.content.split(' ');
    console.log(remind)
  }
})

*/

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
    let rolearray = (message.guild.roles.get(personid))






    embed()
    function embed() {
      if (typeof points !== "undefined" && typeof level !== "undefined" && typeof youtube !== "undefined" && typeof twitch !== "undefined" && typeof steam !== "undefined") {
        (message.channel.send({
          "embed": {

            "description": "Customize your profile! To see how, type `!help`",

            "color": 11161093,
            "timestamp": (message.createdAt),
            "footer": {
              "text": "Requested by " + (message.author.username)
            },
            "thumbnail": {
              "url": "https://cdn.discordapp.com/attachments/353555990815440897/355673097434824704/actualtpflogo.png"
            },

            "author": {
              "name": (person) + "'s profile",
              "icon_url": (person.avatarURL)
            },
            "fields": [
              {
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
        )
      } else {
        setTimeout(embed, 250);

      }

    }
  }
})
