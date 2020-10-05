const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const Discord = require("discord.js");

exports.auditMessageDelete = (client, message) => { 
    const auditLogChannel = message.guild.channels.cache.find(c => c.name == "audit-log")
    var messageAuthor = message.author.username
    var deletedChannelID = message.channel.id
    var deletedMessage = message.cleanContent
    var time = new Date().toString()
    function checkIfBot(message) { 
        if (message.author.bot) { 
            return "A robot"
        } else { 
            return "A human"
        }
    }

    var escapeMarkdown = function(text) {       
        var result = text.replace(/`/g, '');        
        return result
     };
      
    var embed = new Discord.MessageEmbed()
        .setColor("#d19630")
        .setTitle("Message deleted")
        .setDescription(`\`\`\`${escapeMarkdown(deletedMessage)}\`\`\``)
        .addField("Author", messageAuthor + "#" + message.author.discriminator)
        .addField("Channel", `<#${deletedChannelID}>`)
        .addField("Time", time)
        .addField("Sender", checkIfBot(message))
        .setFooter("Message Logger")

    auditLogChannel.send(embed).catch(e => console.log(e))
}

exports.auditMemberJoin = (client, member) => { 
    const auditLogChannel = member.guild.channels.cache.find(c => c.name == "audit-log")
    var time = new Date().toString()
    var currentTimestamp = new Date().getTime()
    var createdTimestamp = member.user.createdTimestamp
    var accountAge = Math.round((currentTimestamp - createdTimestamp)/86400000)
    var embed = new Discord.MessageEmbed()
        .setColor("#3dba36")
        .setTitle("Member joined.")
        .setDescription(`Members increased from ${member.guild.memberCount - 1} to ${member.guild.memberCount}`)
        .addField("Name", member.user.username)
        .addField("ID", member.user.id)
        .addField("Time", time) 
        .addField("Account creation date", member.user.createdAt.toString())   
        .addField("Account age", `${accountAge} days`)    
        .setFooter("Join Logger")
    auditLogChannel.send(embed)

    if (accountAge < 2) { 
        var admin = member.guild.channels.cache.find(c => c.name == "admin-talk")
        console.log(admin)
        admin.send(`User ${member.user.username} joined whose account was created only \`${accountAge}\` days ago. More details found in <#${auditLogChannel.id}>.`)
    }
    
}

exports.auditMemberLeave = (client, member) => { 
    const auditLogChannel = member.guild.channels.cache.find(c => c.name == "audit-log")
    var time = new Date().toString()
    var embed = new Discord.MessageEmbed()
        .setColor("#b82828")
        .setTitle("Member left.")
        .setDescription(`Members decreased from ${member.guild.memberCount + 1} to ${member.guild.memberCount}`)
        .addField("Name", member.user.username)
        .addField("ID", member.user.id)
        .addField("Time", time)        
        .setFooter("Leave Logger")
    auditLogChannel.send(embed)
}