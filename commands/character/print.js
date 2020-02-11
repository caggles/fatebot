const { Command } = require('discord.js-commando')
const printCharacter = require('../../functions/print-character')

module.exports = class PrintCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'print',
            group: 'character',
            memberName: 'print',
            description: 'print character',
            examples: [ '`!print` to print your own character',
                        '`!print tag` to print another user\'s character, available only to staff'],
        });
    }

    run(message) {
        let msglist = message.content.split(" ")
        let nickname = ''
        let userid = ''

        try {

            if (msglist.length == 1) {
                userid = message.author.id
            } else if (msglist.length == 2) {
                userid = msglist[1]
                userid = userid.replace('<','').replace('>','').replace('@', '').replace('!','')
            }

            printCharacter(message, userid, 'all', 'view');

        } catch (err) {
            message.reply(err.message)
        }


    }
}