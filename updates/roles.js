// updating roles

const sql = require("sqlite");
const config = require("../configuration/config.json");
sql.open("./scoring/scores.sqlite");

var announcements = "386091548388884480"
var audit_log = "382371100690219028"

var BotStuff_audit = "382372304619044865"
var BotStuff_ann = "382372383421628417"


module.exports.updateRole = (message) => { 

    client.channels.get(audit_log).send("Updating user roles for " + Month())
    client.channels.get(announcements).send("Active user roles have been updated for " + Month())
    console.log("updating role")
    let guild = client.guilds.find("name", "Transport Fever")
    var role = guild.roles.find("name", activeUser)
    if (!role) { console.log("role doesn't exist") } else { role.delete() }

    setTimeout(function () {
        guild.createRole({
            name: activeUser,
            color: "GOLD",
            hoist: true,
            position: 4,
        })
    }, 200)
    setTimeout(retrieveData, 1000)

    setTimeout(clearDatabase, 3000)

    //retrieve who is top
    function retrieveData() {
        sql.all(`SELECT userId, username, points FROM scores ORDER BY points DESC LIMIT 6`).then(rows => { // select each column               

            for (var i = 0; i < 6; i++) {
                console.log(`${rows[i].userId}`)
                let person = guild.members.get(rows[i].userId)
                let points = rows[i].points
                let NameOfUser = rows[i].username
                if (typeof person === "undefined") {
                    client.channels.get(audit_log).send(NameOfUser + " is not in the guild, not updating. " + new Date().toString())
                } else {
                    //person is not undefined
                    var myRole = guild.roles.find("name", activeUser)                    
                    person.addRole(myRole).catch(console.error)                  
                    client.channels.get(announcements).send("User " + NameOfUser + " now has the role with " + points + " points!")
                }
                if (i === 5) {
                    client.channels.get(announcements).send("Roles have been updated on " + new Date().toString())
                }

            }
        })
    }
    //add new column   
    let table_name = Month() + "_" + Year() 
    console.log(table_name)
    function delRecords() { sql.run(`UPDATE scores SET points ='0', level = '0'`).catch((e) => console.log(e)) }
    function clearDatabase() {
        sql.run(`ALTER TABLE scores ADD COLUMN '${table_name}'`).then(() => {
            sql.run(`UPDATE scores SET '${table_name}' = points`).then(() => delRecords())
        }).catch(e => console.log(e))
    }


}

module.exports.updateRoleTestVersion = (message) => { 
    
    client.channels.get(BotStuff_audit).send("Updating user roles for " + Month())
    client.channels.get(BotStuff_ann).send("Active user roles have been updated for " + Month())
    console.log("updating role")
    let guild = client.guilds.find("name", "Transport Fever")
    var role = guild.roles.find("name", activeUser)
    if (!role) { console.log("role doesn't exist") } else { role.delete() }

    setTimeout(function () {
        guild.createRole({
            name: activeUser,
            color: "GOLD",
            hoist: true,
            position: 4,
        })
    }, 200)
    setTimeout(retrieveData, 1000)

    setTimeout(clearDatabase, 3000)

    //retrieve who is top
    function retrieveData() {
        sql.all(`SELECT userId, username, points FROM scores ORDER BY points DESC LIMIT 6`).then(rows => { // select each column               

            for (var i = 0; i < 6; i++) {
                console.log(`${rows[i].userId}`)
                let person = guild.members.get(rows[i].userId)
                let points = rows[i].points
                let NameOfUser = rows[i].username
                if (typeof person === "undefined") {
                    client.channels.get(BotStuff_audit).send(NameOfUser + " is not in the guild, not updating. " + new Date().toString())
                } else {
                    //person is not undefined

                    var myRole = guild.roles.find("name", activeUser)
                    //console.log(myRole)
                    person.addRole(myRole).catch(console.error)
                    // console.log(typeof person)
                    client.channels.get(BotStuff_ann).send("User " + NameOfUser + " now has the role with " + points + " points!")
                }
                if (i === 5) {
                    client.channels.get(BotStuff_ann).send("Roles have been updated on " + new Date().toString())
                }

            }
        })
    }

    /* 
        1. add columns total_score and date of year, check if exists, if already, do nothing
        2. set date of year to points
        3. Add points to total score 
        4. set points to zero
    */


    //add new column   
    let table_name = Month() + "_" + Year() // add String() ? 
    console.log(table_name)
    function delRecords() { sql.run(`UPDATE scores SET points ='0', level = '0'`).catch((e) => console.log(e)) }
    function clearDatabase() {
        sql.run(`ALTER TABLE scores ADD COLUMN '${table_name}'`).then(() => { // Add New_Month column (delete this)
            sql.run(`UPDATE scores SET '${table_name}' = points`).then(() => delRecords())
        }).catch(e => console.log(e))
    }

}

    