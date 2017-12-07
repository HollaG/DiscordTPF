//points updating
const sql = require("sqlite");
const config = require("../configuration/config.json");
sql.open("./scoring/scores.sqlite");
module.exports.update = (message) => {
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

module.exports.checkInfo = (message) => {
    var mclength = (message.content.split(' '))
    let nameofuser;
    let usernumber;
    if (message.mentions.users.first()) {
        usernumber = message.mentions.users.first().id
        nameofuser = message.mentions.users.first().username
    } else {
        usernumber = message.author.id
        nameofuser = message.author.username
    }

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
    } 
}


