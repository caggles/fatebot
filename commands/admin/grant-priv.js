const Discord = require('discord.js');
const { Command } = require('discord.js-commando');
const privCheck = require('../../functions/priv-check')

module.exports = class GrantPrivCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'grant-priv',
            group: 'admin',
            memberName: 'grant-priv',
            description: 'grant a privilege to a discord role.',
            examples: [],
            args: [
                {
                    key: 'privilege',
                    prompt: 'Provide privilege name',
                    type: 'string'
                },
                {
                    key: 'role',
                    prompt: 'Provide role name',
                    type: 'string'
                }
            ]
        });
    }

    run(message, {privilege, role}) {

        let priv_promise = privCheck(message, 'admin')
        priv_promise.then(function() {
            message.reply("sorry, this command doesn't do anything yet.")
        });

    }
};


