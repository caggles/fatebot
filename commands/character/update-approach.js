const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
const printPretty = require('../../functions/print-pretty')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()


module.exports = class UpdateApproachCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'update-approach',
            group: 'character',
            memberName: 'update-approach',
            description: 'change one of your character\'s approaches',
            examples: ['`!update-approach`'],
            args: [
                {
                    key: 'approach',
                    prompt: 'Which approach are you changing?\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'value',
                    prompt: 'What is its new value? It may not exceed 5.',
                    type: 'integer',
                    oneOf: [0, 1, 2, 3, 4, 5]
                },
            ]
        });
    }

    async run(message, {approach, value}) {
        try {

            approach = approach.toString().toLowerCase().trim();
            value = parseInt(value);

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let field = 'approaches.' + approach;
                let update = { $set: {[field]: value} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printPretty(message, message.author.id, 'approaches', 'edit')

                })
                .catch(function (err) {
                    message.reply('Error: ' + err)
                });
            });
        } catch (err) {
            message.reply('Error: ' + err)
        }
    }
}
