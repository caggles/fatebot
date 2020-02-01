const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

const fudge = {'-1': '-', '0': 'b', '1': '+'}

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'dice',
            memberName: 'dice',
            aliases: ['r'],
            description: 'rolls FATE dice',
            examples: [ '`!roll 5` to roll a 4dF+5',
                        '`!r 3` to roll 4dF+3',
                        '`!roll 5 $athletics` to give 4dF+5 and label it as an athletics roll']
        });
    }

    run(message) {
        let useravatar = message.author.avatarURL;
        let msglist = message.content.split(" ");
        let msgname = message.content.split("$")[1];
        let desc = "";
        let title = "";
        let color = 0xFFFFFF;

        try {

            let bonus = Number(msglist[1])

            //roll dice
            let roll1 = Math.ceil(Math.random() * 3) - 2;
            let roll2 = Math.ceil(Math.random() * 3) - 2;
            let roll3 = Math.ceil(Math.random() * 3) - 2;
            let roll4 = Math.ceil(Math.random() * 3) - 2;

            let totalroll = roll1 + roll2 + roll3 + roll4 + bonus;
            desc = "[" + fudge[roll1.toString()] + "] [" + fudge[roll2.toString()] + "] [" + fudge[roll3.toString()] + "] [" + fudge[roll4.toString()] + "] + " + bonus.toString() + " = " + totalroll;

            switch (Number(totalroll)) {
                case -4:
                    title += "Yikes :skull:";
                    color = 0xFF0000;
                    break;
                case -3:
                    title += "Oof :frowning:";
                    color = 0xFF0000;
                    break;
                case -2:
                    title += "Terrible";
                    color = 0xFF0000;
                    break;
                case -1:
                    title += "Poor";
                    color = 0xFF0000;
                    break;
                case 0:
                    title += "Mediocre";
                    color = 0xFFFF00;
                    break;
                case 1:
                    title += "Average";
                    color = 0xFFFF00;
                    break;
                case 2:
                    title += "Fair";
                    color = 0xFFFF00;
                    break;
                case 3:
                    title += "Good";
                    color = 0x00FF00;
                    break;
                case 4:
                    title += "Great";
                    color = 0x00FF00;
                    break;
                case 5:
                    title += "Superb";
                    color = 0x00FF00;
                    break;
                case 6:
                    title += "Fantastic";
                    color = 0xFF00FF;
                    break;
                default:
                    title += "Legendary";
                    color = 0xFF00FF;
                    break;
            }

            if (msgname !== undefined) {
                title += " " + msgname
            }

            if (totalroll > 5) {
                title += "!"
            }

            // catch errors
        } catch (err) {
            title = "error";
            desc = "something went wrong: " + err
        }

        // pretty response
        const embedMessage = new Discord.RichEmbed()
            .setTitle(title)
            .setColor(color)
            .setDescription(desc)
            .setThumbnail(useravatar);


        // Send the embed to the same channel as the message
        message.embed(embedMessage);
    }
};

