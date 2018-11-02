const config = require("../configuration/config.json");
const tokenId = require("../configuration/tokenId.json");
const languages = require("../configuration/languages.json")
const data = require("../configuration/data.json")

const translate = require("translate")
const randomColor = require("randomcolor")
const Discord = require("discord.js")
const fs = require("fs")

translate.engine = 'yandex'
translate.key = tokenId.translateKey

const listOfLanguages = languages.lang 

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function createEmbed(client, message, args, originalSentence, translateFrom, translateTo) { 
    
    var translatedSentence = await translate((originalSentence), {
        from: translateFrom,
        to: translateTo
    })    

    const embed = new Discord.RichEmbed()
        .setAuthor(`Translating from ${translateFrom} to ${translateTo}`, client.user.displayAvatarURL)
        .setColor(randomColor())
        .setTimestamp()            
        .setFooter(`Translation #${data.translateCount}`, client.user.displayAvatarURL)
        .addField(`Original sentence (${translateFrom}):`, `\`\`\`${originalSentence}\`\`\``)
        .addField(`Translated sentence (${translateTo}):`, `\`\`\`${translatedSentence}\`\`\``)
        .addBlankField()
        .addField("Powered by Yandex.Translate", "http://translate.yandex.com/")
    
    let newCount = data.translateCount + 1
    data.translateCount = newCount   
    fs.writeFile("./configuration/data.json", JSON.stringify(data, null, 2), (err) => { 
        if (err) message.channel.send(err, {code: ""})        
    })
    return embed
}

exports.breaker = async (client, message, args) => { 
    
    console.log(args[0])    

    var translateTo; var translateFrom
    var originalSentence = args.slice()
    if (listOfLanguages.includes(capitalizeFirstLetter(args[0]))) { 
        if (listOfLanguages.includes(capitalizeFirstLetter(args[1]))) { 
            // If both language to convert TO and FROM is specified
            // Do stuff
            
            originalSentence.shift()
            originalSentence.shift() // array         

            translateFrom = capitalizeFirstLetter(args[0])
            translateTo = capitalizeFirstLetter(args[1])
            
            message.channel.send(await createEmbed(client, message, args, originalSentence.join(" "), translateFrom, translateTo))            
        } else { 
            // If only one language is specified, assume it is converting TO that language
            // Do stuff

            originalSentence.shift() //array

            translateFrom = "English"
            translateTo = capitalizeFirstLetter(args[0])

            message.channel.send(await createEmbed(client, message, args, originalSentence.join(" "), translateFrom, translateTo))          
            
        }

    } else { 
        // Return error because language not specified
        message.reply("You must specify the language! See !help language for more information.")

    }

}
