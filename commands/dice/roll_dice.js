const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'dice',
            memberName: 'dice',
            description: 'rolls CoD dice',
            examples: [ '`!roll 5` to roll a normal pool of 5 dice',
                        '`!roll 3 9a` to roll a pool of 3 dice with 9 agains',
                        '`!roll chance` to roll a chance die',
                        '`!roll 5 $wits+comp` to give 5 dice and label it as a wits+comp roll']
        });
    }

    run(message) {
        let useravatar = message.author.avatarURL
        let msglist = message.content.split(" ")
        let msgname = message.content.split("$")[1]
        let desc = ""
        let title = ""
        let color = 0xFFFFFF

        try {
            if (msglist[1].toLowerCase() == 'chance') {
                let roll = Math.ceil(Math.random() * 10)
                if (msgname !== undefined) {
                    title += msgname + "\n"
                }
                if (roll == 10) {
                    title += 'success'
                    desc += roll
                    color = 0xFFFF00
                } else {
                    title += 'failure'
                    desc += roll
                    color = 0xFF0000
                }
            } else {
                let dicepool = Number(msglist[1])
                let explode = 10
                let suxx = 0

                if (msglist[2] !== undefined && (msglist[2] == "9a" || msglist[2] == "9again" || msglist[2] == "9agains" || msglist[2] == "9")) {
                    explode = 9
                } else if (msglist[2] !== undefined && (msglist[2] == "8a" || msglist[2] == "8again" || msglist[2] == "8agains" || msglist[2] == "8")) {
                    explode = 8
                } else {
                    explode = 10
                }

                //loop through the total number of dice in the pool
                for (let i = 1; i <= dicepool; i++) {
                    let die_result = roll_die(explode, suxx)
                    desc += die_result[0]
                    suxx = die_result[1]
                    if (i != dicepool) {
                        desc += ", "
                    }
                }

                if (msgname !== undefined) {
                    title += msgname + "\n"
                }

                switch (Number(suxx)) {
                    case 0:
                        title += "failure"
                        color = 0xFF0000
                        break;
                    case 1:
                        title += suxx + " success"
                        color = 0xFFFF00
                        break;
                    case 2:
                    case 3:
                    case 4:
                        title += suxx + " successes"
                        color = 0x009900
                        break;
                    default:
                        title += suxx + " successes\nexceptional success"
                        color = 0x00FF00
                        break;
                }
            }

            // catch errors
        } catch (err) {
            title = "error"
            desc = "something went wrong: " + err
        }

        // pretty response
        const embedMessage = new Discord.RichEmbed()
            .setTitle(title)
            .setColor(color)
            .setDescription(desc)
            .setThumbnail(useravatar)


        // Send the embed to the same channel as the message
        message.embed(embedMessage);
    }
};

let roll_die = (explode, suxx) => {
    let roll = Math.ceil(Math.random() * 10)
    let roll_result = roll
    if (roll >= 8) {
        suxx++
    }
    if (roll >= explode) {
        let dice_result = roll_die(explode, suxx)
        roll_result += " (" + dice_result[0] + ")"
        suxx = dice_result[1]
    }
    return [roll_result, suxx]
}
