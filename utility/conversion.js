const convert = require("convert-units");

module.exports.convertUnits = (message, value, unit1, unit2) => {
    var result;
    console.log(value, unit1, unit2)
    try {
        result = convert(value).from(unit1).to(unit2)
        message.channel.send(`${result} ${unit2}`, { code: "xl" })
        
    } catch (e) { 
        try { 
            result = convert(value.toLowerCase()).from(unit1.toLowerCase()).to(unit2.toLowerCase())
            message.channel.send(`${result} ${unit2}`, { code: "xl" })


        } catch (e) { 
            try { 
                result = convert(value.toUpperCase()).from(unit1.toUpperCase()).to(unit2.toUpperCase())
                message.channel.send(`${result} ${unit2}`, { code: "xl" })


            } catch (e) { 
                message.channel.send(`${unit1} cannot be converted to ${unit2}!`)
            }
            
            
        }
        


        
    }
}

module.exports.showTypes = (message, type) => {
    var result;
    var arr = convert().possibilities()
    console.log(!convert().possibilities(type)[0])

    if (arr.includes(type)) {
        try {
            result = convert().from(type).possibilities()
            message.channel.send(`You can convert to the following types from \`${type}\`: \`\`\`${result.join(", ")}\`\`\``)

        } catch (e) {            
            console.log(e)
        }
    } else {
        if (convert().possibilities(type)[0]) { 
            try {
                result = convert().possibilities(type)
                message.channel.send(`You can convert the following types of \`${type}\`: \`\`\`${result.join(", ")}\`\`\``)
            } catch (e) {               
                console.log(e)
            }
        } else { 
            message.channel.send(`${type} is not a valid unit / measure!`)
        }
        
    }



}
