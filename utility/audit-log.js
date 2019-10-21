const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const Discord = require("discord.js");

exports.audit = (client, message) => { 
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
        .setColor("#ad2424")
        .setTitle("Message deleted")
        .setDescription(`\`\`\`${escapeMarkdown(deletedMessage)}\`\`\``)
        .addField("Author", messageAuthor)
        .addField("Channel", `<#${deletedChannelID}>`)
        .addField("Time", time)
        .addField("Deletor", checkIfBot(message))
        .setFooter("Message Logger")

    auditLogChannel.send(embed)
}