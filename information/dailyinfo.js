const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const mysql = require("mysql2/promise")
const util = require('util');
const Discord = require("discord.js");

var db_config = { 
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,
    database: "serverInfoDB",
    charset: "utf8"
};
var db_config_pool = { 
    connectionLimit: 25,
    host: tokenId.host,
    user: "holla",
    password: tokenId.pass,
    database: "serverInfoDB",
    charset: "utf8"
};
(async() => { 
    try { 
        var connection = await mysql.createConnection(db_config);
        // const query = util.promisify(connection.query).bind(connection);
        // connection.connect()
        connection.execute(`CREATE TABLE IF NOT EXISTS serverInfo
        ( 
            Date varchar(100),
            NumberOfUsersYesterday INTEGER,
            NumberOfUsersToday INTEGER,
            NetUserChange INTEGER,
            TotalMessagesSent INTEGER,
            MostActiveChannel TEXT,
            MostActiveUser TEXT
        )
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)

        connection.execute(`CREATE TABLE IF NOT EXISTS channelInfo
        ( 
            channelID varchar(100),
            channelName varchar(100),
            numberSent INTEGER
        )
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)

        connection.execute(`CREATE TABLE IF NOT EXISTS userInfo
        ( 
            userID varchar(100),
            username varchar(100),
            numberSent INTEGER
        )
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
    } catch (e) { 
        console.log(e)
    }
})();

/* 
DayMonthYear:
Number of users yesterday:
Number of users today:
Net user change: 
Total message sent count:
Most active channel: [#channel] with [messagecount]
Most active user: [#user(identifier)] with [messagecount]
*/

function getDayBeforeYesterday() { 
    var date = new Date();
    date.setDate(date.getDate() - 2);    
    var split = date.toString().split(" ").slice(0, 4)
    split.push(split.shift());
    return split.join(" ")
}

function getYesterdayDate() { 
    var date = new Date();
    date.setDate(date.getDate() - 1);    
    var split = date.toString().split(" ").slice(0, 4)
    split.push(split.shift());
    return split.join(" ")
}

exports.updateDaily = async (client, mainServer) => {  
    /* 
    A: DayMonthYear [Date] ok
    B: Number of users yesterday [Integer]
    C: Number of users today [Integer]
    D: Net user change [Integer] 
    E: Total message sent count [Integer]
    F: Most active channel: [#channel] with [messagecount]
    G: Most active user: [#user(identifier)] with [messagecount]
    */
    var a = getYesterdayDate();
    var connection = await mysql.createConnection(db_config);
    var result1 = await connection.query(`SELECT NumberOfUsersToday FROM serverInfo WHERE Date = ?`, [getDayBeforeYesterday()])
    var b = (result1[0][0]) ? result1[0][0].NumberOfUsersToday : 0    
    var c = client.guilds.get(mainServer).memberCount
    var d = c - b
    var result2 = await connection.query(`SELECT SUM(numberSent) AS messageCount FROM channelInfo`)
    var e = (result2[0][0]) ? result2[0][0].messageCount : 0
    var result3 = await connection.query(`SELECT * FROM channelInfo ORDER BY numberSent DESC LIMIT 3`)
    var fArr = []   
    for (i in result3[0]) { 
        var string = `<#${result3[0][i].channelID}> with ${result3[0][i].numberSent} messages` // #servername with X messages 
        fArr.push(string)
    }
    var f = fArr.join("\n")
    var gArr = []
    var result4 = await connection.query(`SELECT * FROM userInfo ORDER BY numberSent DESC LIMIT 3`)
    for (j in result4[0]) { 
        var string = `${result4[0][j].username} with ${result4[0][j].numberSent} messages` // [Username] with X messages
        gArr.push(string)
    }  
    var g = gArr.join("\n")

    // update the Database

    var result5 = await connection.query(`SELECT * FROM serverInfo WHERE Date = ?`, [getYesterdayDate()])
    if (!result5[0][0]) { 
        connection.execute('INSERT INTO serverInfo (Date, NumberOfUsersYesterday, NumberOfUsersToday, NetUserChange, TotalMessagesSent, MostActiveChannel, MostActiveUser) VALUES (?, ?, ?, ?, ?, ?, ?)', [a, b, c, d, e, f, g])
    } else { 
        client.channels.find("name", "botstuff").send(`Error updating dailyinfo: The database has already been updated with ${getYesterdayDate()}'s information.`)
    }

    // send the update message 

    var stats = client.channels.find("name", "statistics")
    const embed = new Discord.RichEmbed()
        .setTitle(`Server statistics for ${getYesterdayDate()}`)
        .setDescription("A compilation of the day's events.")
        .setColor("#5f87ed")
        .addField("Date", a ? a : 0)
        .addField("Number of users yesterday", b ? b : 0)
        .addField("Number of users now", c ? c : 0, true)
        .addField("Net user change", d ? d : 0)
        .addField("Total messages sent yesterday", e ? e : 0, true)
        .addField("Most active channels", f ? f : 0)
        .addField("Most active people", g ? g : 0)
        .setTimestamp()
        .setFooter("Daily statistic bot", client.user.avatarURL)
        .setThumbnail(client.user.avatarURL)

    stats.send(embed)
    
    // delete the daily info updates

    await connection.execute("DELETE FROM userInfo")
    await connection.execute("DELETE FROM channelInfo")
    connection.end()
    
}

var pool = mysql.createPool(db_config_pool)
pool.on('error', (err) => { 
    if (err) { 
        console.log(err)
    }
})
exports.logSpecificChannel = async (client, message, mainServer) => { 
    // fires whenever a message is sent
    var channelID = message.channel.id
    var channelName = message.channel.name

    // var connection = await mysql.createConnection(db_config);
    var result = await pool.query(`SELECT * FROM channelInfo WHERE channelID = ${channelID}`)
    try { 
        if (!result[0][0]) { // if no result, add the channel as a new entry
            console.log("No result")
            pool.execute(`INSERT INTO channelInfo SET channelId = ?, channelName = ?, numberSent = ?` ,[channelID, channelName, 1])
        } else { // update the existing entry
            pool.execute(`UPDATE channelInfo SET numberSent = ${result[0][0].numberSent + 1} WHERE channelID = ${channelID}`)
        }  
    } catch (e) {
        console.log(e)
    }
};

exports.logSpecificUser = async (client, message, mainServer) => { 
    // var connection = await mysql.createConnection(db_config);
    var result = await pool.query(`SELECT * FROM userInfo WHERE userId = ${message.author.id}`)
    try { 
        if (!result[0][0]) { 
            pool.execute(`INSERT INTO userInfo SET userId = ?, username = ?, numberSent = ?`, [message.author.id, message.author.username, 1])
        } else {
            pool.execute(`UPDATE userInfo SET numberSent = ${result[0][0].numberSent + 1} WHERE userId = ${message.author.id}`)
        }
    } catch (e) {
        console.log(e)
    }
}

exports.checkYesterdayInfo = async (client, message, mainServer) => { 
    var connection = await mysql.createConnection(db_config);
    var result = await connection.query(`SELECT * FROM serverInfo WHERE Date = ?`, [getYesterdayDate()])    
    var a = result[0][0] ? result[0][0].Date : 0
    var b = result[0][0] ? result[0][0].NumberOfUsersYesterday : 0
    var c = result[0][0] ? result[0][0].NumberOfUsersToday : 0
    var d = result[0][0] ? result[0][0].NetUserChange : 0
    var e = result[0][0] ? result[0][0].TotalMessagesSent : 0
    var f = result[0][0] ? result[0][0].MostActiveChannel : 0
    var g = result[0][0] ? result[0][0].MostActiveUser : 0
    const embed = new Discord.RichEmbed()
        .setTitle(`Server statistics for ${getYesterdayDate()}`)
        .setDescription("A compilation of the day's events.")
        .setColor("#5f87ed")
        .addField("Date", a)
        .addField("Number of users yesterday", b)
        .addField("Number of users now", c, true)
        .addField("Net user change", d)
        .addField("Total messages sent yesterday", e, true)
        .addField("Most active channels", f)
        .addField("Most active people", g)
        .setTimestamp()
        .setFooter("Daily statistic bot", client.user.avatarURL)
        .setThumbnail(client.user.avatarURL)

    message.channel.send(embed)
    connection.end()
}