const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const Discord = require("discord.js");

exports.auditMessageDelete = (client, message) => { 
    const auditLogChannel = message.guild.channels.find("name", "audit-log")
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
      
    var embed = new Discord.RichEmbed()
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
    const auditLogChannel = member.guild.channels.find("name", "audit-log")
    var time = new Date().toString()
    var embed = new Discord.RichEmbed()
        .setColor("#3dba36")
        .setTitle("Member joined.")
        .setDescription(`Members increased from ${member.guild.memberCount - 1} to ${member.guild.memberCount}`)
        .addField("Name", member.user.username)
        .addField("ID", member.user.id)
        .addField("Time", time) 
        .addField("Account creation date", member.user.createdAt.toString())       
        .setFooter("Join Logger")
    auditLogChannel.send(embed)
}

exports.auditMemberLeave = (client, member) => { 
    const auditLogChannel = member.guild.channels.find("name", "audit-log")
    var time = new Date().toString()
    var embed = new Discord.RichEmbed()
        .setColor("#b82828")
        .setTitle("Member left.")
        .setDescription(`Members decreased from ${member.guild.memberCount + 1} to ${member.guild.memberCount}`)
        .addField("Name", member.user.username)
        .addField("ID", member.user.id)
        .addField("Time", time)        
        .setFooter("Leave Logger")
    auditLogChannel.send(embed)
}