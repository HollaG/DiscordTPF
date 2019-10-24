const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const mysql = require("mysql2/promise")
const util = require('util');


var db_config = { 
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
            MostActiveChannel varchar(100),
            MostActiveUser varchar(100)
        )
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)

        connection.execute(`CREATE TABLE IF NOT EXISTS channelInfo
        ( 
            channelID varchar(100),
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
    var a = getYesterdayDate();
  
    /* 
    A: DayMonthYear [Date] ok
    B: Number of users yesterday [Integer]
    C: Number of users today [Integer]
    D: Net user change [Integer] 
    E: Total message sent count [Integer]
    F: Most active channel: [#channel] with [messagecount]
    G: Most active user: [#user(identifier)] with [messagecount]
    */
    var connection = await mysql.createConnection(db_config);
    var result1 = await connection.query(`SELECT NumberOfUsersToday FROM serverInfo WHERE Date = ?`, [getDayBeforeYesterday()])
    var b = result1[0][0].NumberOfUsersToday
    var c = client.guilds.get(mainServer).memberCount
    var d = c - d
    var result2 = await connection.query(`SELECT COUNT(numberSent) FROM channelinfo`)
    console.log(result2[0])
   

  
    // var connection = mysql.createConnection(db_config);
    // connection.connect()
    // var B; 
    // await connection.query(`SELECT NumberOfUsersToday FROM serverInfo WHERE Date = ?`, [getDayBeforeYesterday()], (err, res) => { 
    //     B = res[0]
    // })
    // console.log(B)
    
    // connection.end()


   

    // run the queries
    






}

exports.logSpecificChannel = async (client, message, mainServer) => { 
    // fires whenever a message is sent
    var channelID = message.channel.id
    var connection = await mysql.createConnection(db_config);
    var result = await connection.query(`SELECT * FROM channelinfo WHERE channelID = ${channelID}`)
    try { 
        if (!result[0][0]) { // if no result, add the channel as a new entry
            connection.execute(`INSERT INTO channelinfo (channelID, numberSent) VALUES (${channelID}, 1)`)
        } else { // update the existing entry
            connection.execute(`UPDATE channelinfo SET numberSent = ${result[0][0].numberSent + 1} WHERE channelID = ${channelID}`)
        }  
    } catch (e) { 
        console.log(e)
    }
};

exports.logSpecificUser = async (client, message, mainServer) => { 
    var connection = await mysql.createConnection(db_config);
    var result = await connection.query(`SELECT * FROM userInfo WHERE userId = ${message.author.id}`)
    try { 
        if (!result[0][0]) { 
            connection.execute(`INSERT INTO userInfo SET userId = ?, username = ?, numberSent = ?`, [message.author.id, message.author.username, 1])
        } else {
            connection.execute(`UPDATE userInfo SET numberSent = ${result[0][0].numberSent + 1} WHERE userId = ${message.author.id}`)
        }
    } catch (e) {
        console.log(e)
    }
}


// (async() => { 
//     var connection = await mysql.createConnection(db_config)
//     connection.execute(`DELETE FROM channelInfo`)
// })();


/*
sql.run('INSERT INTO dailyInfo (Date, NumberOfUsersYesterday, NumberOfUsersToday, NetUserChange, TotalMessageSendCount, MostActiveChannel, MostActiveUser) VALUES (?, ?, ?, ?, ?, ?, ?)', ["test", 1, 1, 1, 1, "test", "test"]).catch(() => {
    sql.run('CREATE TABLE IF NOT EXISTS dailyInfo (Date TEXT, NumberOfUserYesterday INTEGER, NumberOfUsersToday INTEGER, NetUserChange INTEGER, TotalMessageSendCount INTEGER, MostActiveChannel STRING, MostActiveUser STRING)').then(() => {
        sql.run('INSERT INTO dailyInfo (Date, NumberOfUsersYesterday, NumberOfUsersToday, NetUserChange, TotalMessageSendCount, MostActiveChannel, MostActiveUser) VALUES (?, ?, ?, ?, ?, ?, ?)', ["test", 1, 1, 1, 1, "test", "test"])
        // sql.run('INSERT INTO dailyInfo (Date, NumberOfUsersYesterday, NumberOfUsersToday, NetUserChange, TotalMessageSendCount, MostActiveChannel, MostActiveUser) VALUES (?, ?, ?, ?, ?, ?, ?)', [a,b,c,d,e,f,g])
    }).catch(e => console.log(e))


})
*/