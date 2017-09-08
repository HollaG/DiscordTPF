const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const sql = require("sqlite");
sql.open("./score.sqlite");

var welcome = "246190912315719680" //TpF wlc channel
let messageCount = JSON.parse(fs.readFileSync("./points.json", "utf8"));
let twitchLink = JSON.parse(fs.readFileSync("./points.json", "utf8"));

client.login("MzM1NDIyMDYxNDg2OTMxOTY5.DEphqA.9bcXN8X5Xa-tiziUgHitTuGxrww");

client.on("ready", () => {
  console.log("I am ready!");
  client.user.setGame("transportfever.com");

});

/*client.on("message", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("screw you");
  } else
  if (message.content.startsWith("LUL")) {
    message.channel.send("shut up");

  }
*/

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

/*client.on("message", (message) => { 
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;
  
  //if (!messageCount[message.author.id]) messageCount[message.author.id] = {
    //messageCount: 0,
  //}
  if (!twitchLink[message.author.id]) twitchLink[message.author.id] = {
    twitchLink: " "
  } 
  //let userData = messageCount[message.author.id];
  let userData = twitchLink[message.author.id];


  //messageCount[message.author.id].messageCount++

    //if (message.content.startsWith(config.prefix + "messagecount")) {
     // message.reply(`You have sent ${userData.messageCount} messages to date.`);
    //}
    if (message.content.startsWith(config.prefix + "twitch")) {
      message.channel.send(`${message.author}'s Twitch link is ${userData.twitchLink}.`);
    }
    

  fs.writeFile("./points.json", JSON.stringify(messageCount), (err) => {
      if (err) console.error(err)
  });
});
*/

//const prefix = "!";


client.on("message", message => {
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;
  var mlength = (message.content).length
    console.log(mlength)
  
  
  
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    } else {
      let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
      if (curLevel > row.level) {
        row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
        message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });

  if (!message.content.startsWith(config.prefix) || (mlength < 8) ) return;
  //if (message.content == (message.mentions.members.first())) return;

  if (message.content.startsWith(config.prefix + "level")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.reply("Your current level is 0");
      message.reply(`Your current level is ${row.level}`);
    });
  } else

  if (message.content.startsWith(config.prefix + "mcount")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.reply("sadly you do not have any messages yet!");
      message.reply(`you have sent \`${row.points}\` messages to date.`);
    });
  }

    
   // var mlength = (message.content.split(' ').length)
    if (mlength < 8) return; 
      else {
     
          message.channel.send("nope") 
      console.log(mlength);
    } 
    
    
    

    var usernumber = (message.mentions.users.first()) 

    console.log(usernumber)
    if(message.content.startsWith(config.prefix + "mcount")) {
      sql.get(`SELECT * FROM scores WHERE userId ="${usernumber}"`).then(row=> {
        if (!row) return message.channel.send("Sadly no messages have been sent by them yet!");
        message.channel.send(`${usernumber} has sent \`${row.points}\` messages to date.`);
      })
 
    }
 
});


client.on("message", (message) => {
  let prefix = "+";
  if (message.author.bot || message.content.split(' ').length > 1) return;

  else
    if (message.content.startsWith(prefix + "asd"))
       message.reply("`message is not more than 1 word in length`");  
});
 
  




client.on("message", (message) => {
  // Set the prefix
    /*  let prefix = "!";
    */
   // Exit and stop if it's not there
  
   

  /*if (message.content == (config.prefix + "ping")) {
    message.channel.send("pong!");
  } else
    
  if (message.content.startsWith(config.prefix + "foo")) {
    message.channel.send("bar!");
  }
  
  if (message.author.bot) return;
  if (message.content == (!message.mentions.members.first()));
    message.channel.send("Acknowledged");
  */




  let responseObject = {
  "!ping": "pong!",
  "!foo": "bar",
  "X.X": "Why that face?"
  }
  let commands = {
  "!help": "```!ping  !foo  !help  !twitch  !mcount !status```",
  "!addbot": "Test-adding...",
  "!twitch": " ",
  "!mcount": "Retrieving message count...",
  "!status": "I am online!"
  }
  if (!message.content.startsWith (config.prefix) || message.author.bot) return; //if message does not start with ! or is sent from a bot, return
  console.log('Message sent')
  
  if(responseObject[message.content] || commands[message.content]) {
      message.channel.send(responseObject[message.content]);
   } else { 
      if(message.content.startsWith(config.prefix)); 
      message.reply("There is no such command. Type `!help` for list of commands");
  } 

  if(commands[message.content]) {
      message.channel.send(commands[message.content]);
  }
});

client.on("message", (message) => {
  if (message.author.bot) return;

   let wordResponse = {
      "X.X" : "Why that face?",
      ":frowning:" : "Don't be sad...",
      "hi": "hello!",
      "bye": "Aww, goodbye :(",
      "gn": "Goodnight!",
      "thanks": "you're welcome :)"
   }
  if (wordResponse[message.content]) {
      message.channel.send(wordResponse[message.content]);
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
//no!needed
/* client.on("message", (message) => {
    if (message.content == ("thanks")) {
        message.channel.send("You're welcome. :heart:");
    }
  });
});
*/

//Welcome message
client.on("guildMemberAdd", (member) => {
    console.log(`${member.user.username} has joined TFDiscord`); 
    member.guild.defaultChannel.send(`Welcome ${member.user} to the server! Please read the rules in <#${welcome}>!`);
});


    
      
   



/*client.on("message", message => {
  const args = message.content.split(" ").slice(1);

  if (message.content.startsWith(config.prefix + "eval")) {
    if(message.author.id !== config.ownerID) return;
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
});
*/
/* client.on("message", message => {
  
  if (message.content.startsWith(config.prefix + "ping")) {
    const args = message.content.split(/\s+/g),
  }
 
});

*/





