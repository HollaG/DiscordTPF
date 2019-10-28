const Discord = require("discord.js");

// Admin color: RGB = 155 89 182 Mod color: 214 104 14

const createOneLineEmbed = (desc, color) => {
    var embed = new Discord.RichEmbed()
        .setDescription(desc)
        .setColor(color)
    return embed
}

exports.purgeMessage = async (client, mainServer, message, args) => {
    // console.log(args) [ '2324', '<#462540440277876736>' ]
    /*
    1) Check if mod or admin
    2) Filter the message and separate the channel ID and the number to delete
    SANTISIATION
    3) check if the channel exists
    4) check if number to delete is > 100. if yes then send a message to notify
    
    5) Send a message to ask if you really want to delete with an emoji selector (make sure only the sender can affect it). Delete after 10 seconds.
    5) If sender accepts, delete both messages sent by sender and bot, then delete the rest of the messages
    */

    // step 1 
    var color; var type;
    if (message.member.roles.exists("name", "AdminZ")) {
        color = "#9b59b6"
        type = "AdminZ"
    } else {
        color = "#d6680e"
        type = "MoDerators"
    }

    // step 2
    var number; var channel;
    if ((isNaN(Number(args[0])) && isNaN(Number(args[1]))) || args.length !== 2) { 
        var desc = `**${message.author.username}**, the syntax of the command is: \n\`\`\`!delete [channel] [number of messages]. \nExample: !delete 10 #welcome\`\`\``
        message.channel.send(createOneLineEmbed(desc, color))
        return
    }

    if (isNaN(Number(args[0]))) {
        number = args[1]
        channel = args[0]
    } else {
        number = args[0]
        channel = args[1]
    }
    
    var channelID = channel.replace(/[^a-zA-Z0-9]/g, "")
    var channelToDelete = client.channels.get(channelID)

    // step 3
    var error = 0
    if (!message.guild.channels.get(channelID)) {
        var desc = `**${message.author.username}**, there is no such channel.`
        message.channel.send(createOneLineEmbed(desc, color)).then(m => m.delete(7500))
        error = 1
    }

    //step 4
    if (number > 100 || number == 0) {
        var desc = `**${message.author.username}**, please choose a number between 1 and 100. \n\`\`\`Error: ${number} is not in the range.\`\`\``
        message.channel.send(createOneLineEmbed(desc, color)).then(m => m.delete(7500))
        error = 1
    }

    if (error) {
        message.delete(7500)
        return
    }

    // step 5
    var desc = `**${message.author.username}**, the bot will delete ${number} messages from ${channel}. \nTo confirm this action, please react with a "✔". To reject, react with "❌".\nThis message will be automatically deleted in 10 seconds.`
    var embedMessage = await message.channel.send(createOneLineEmbed(desc, color))
    await embedMessage.react("✔")
    await embedMessage.react("❌")
    const auditLogChannel = message.guild.channels.find("name", "audit-log")
    const filter = (reaction, user) => (reaction.emoji.name === '✔' || reaction.emoji.name === '❌') && user.id === message.author.id
    const collector = embedMessage.createReactionCollector(filter, { time: 10000 });
    collector.on("collect", async r => {
        if (r.emoji.name === '✔') {            
            collector.stop()
            await message.delete()
            await embedMessage.delete()

            channelToDelete.bulkDelete(number)
                .then(msgs => {                     
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Messages bulk deleted**")                        
                        .setColor(color)
                        .addField("Deletor", message.author.username)
                        .addField("Number of messages", msgs.size)
                        .addField("Channel", channel)
                        .addField("Time", new Date().toString())
                    auditLogChannel.send(embed)
            })  
                .catch(e => {
                console.log(e)
                var desc = `**Error**: ${e.message}`
                message.channel.send(createOneLineEmbed(desc, color)).then(m => m.delete(5000))
            })
        }
        if (r.emoji.name === '❌') {
            collector.stop()
            message.delete()
            embedMessage.delete()
        }
    })

    // deletes the command and question automatically
    embedMessage.delete(10000).catch(e => {})
    message.delete(10000).catch(e => {}) 
}