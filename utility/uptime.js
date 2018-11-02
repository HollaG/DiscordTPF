const data = require("../configuration/data.json")

const fs = require("fs")
const Discord = require("discord.js")
const randomColor = require("randomcolor")

data.currentStartUpDate = new Date().toString()
fs.writeFile("./configuration/data.json", JSON.stringify(data, null, 2), (err) => { if (err) console.log(err) })

var previousUptime = data.uptime 
var timeBeforeFirstFunction
data.uptime > Math.pow(2, 32) ? timeBeforeFirstFunction = Math.pow(2, 32) - 1 : timeBeforeFirstFunction = previousUptime // Check to ensure that it does not exceed the 32bit integer limit

var startWhenMore = setInterval(function () { // Call the updating function after the old record or after 2^32 milliseconds (32bit integer limit)
    updateUptime()
}, timeBeforeFirstFunction)

var earliestStartUpDate = new Date().toString()    

function updateUptime() { 
    
    clearInterval(startWhenMore) 
    var updatedOldUptime = false
    setInterval(function () { // If the previous record was more than 25 days, this will just start the interval after 25 days. However, the if statement will ensure that the record only gets updated if it was more than the 25 days.

        if (process.uptime() * 1000 > previousUptime) { // Start to update the uptime
            // write new uptime to file in MILLISECONDS              
            if (!updatedOldUptime) { 
                data.previousUptimeRecord = data.uptime
                data.previousStartUpDate = data.earliestStartUpDate               
            }
            updatedOldUptime = true

            data.uptime = process.uptime() * 1000
            data.earliestStartUpDate = earliestStartUpDate
            fs.writeFile("./configuration/data.json", JSON.stringify(data, null, 2), (err) => {                
                if (err) { 
                    console.log(err)
                } else {
                    console.log("Updated uptime") 
                }             
                
            })
        }

    }, 120000 /*2 hours*/)

}
    
// Uptime checker

exports.checkUptime = (client, message) => { 

    function msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
      
        return `${hrs} hours ${mins} minutes ${secs} seconds ${ms} milliseconds`
        }

    var currentUptime = msToTime(process.uptime() * 1000)
    var uptimeRecord = msToTime(data.uptime)
    var currentStartUpDate = data.currentStartUpDate ? data.currentStartUpDate : "No data!" 
    
    var earliestStartUpDate = data.earliestStartUpDate ? data.earliestStartUpDate : "No data!" 
    var previousUptimeRecord = msToTime(data.previousUptimeRecord)
    var previousStartUpDate = data.previousStartUpDate ? data.previousStartUpDate : "No data!"  

    const embed = new Discord.RichEmbed()
        .setAuthor("Uptime information", client.user.displayAvatarURL)
        .setColor(randomColor())
        .setFooter("Uptime checker module", client.user.displayAvatarURL)
        .setTimestamp()
        .addField("Current uptime:", `\`\`\`${currentUptime}\`\`\``)
        .addField("Latest restart:", `\`\`\`${currentStartUpDate}\`\`\``)
        .addBlankField()
        .addField("Highest recorded uptime:", `\`\`\`${uptimeRecord}\`\`\``)
        .addField("Started on:", `\`\`\`${earliestStartUpDate}\`\`\``)
        .addBlankField()
        .addField("Previous record:", `\`\`\`${previousUptimeRecord}\`\`\``) 
        .addField("Previous record restart:", `\`\`\`${previousStartUpDate}\`\`\``)

    message.channel.send(embed)

}