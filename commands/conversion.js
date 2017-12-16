const convert = require("convert-units");

module.exports.convertUnits = (message, value, unit1, unit2) => {

    message.channel.send(convert(value).from(unit1).to(unit2) + " " + unit2, { code: "xl" })


}

module.exports.showTypes = (message, type) => {
    message.channel.send(convert().from(type).possibilites(), { code: "" })
}