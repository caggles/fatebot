const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class RemoveConditionTrackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove-condition-track',
            group: 'character',
            memberName: 'remove-condition-track',
            description: 'remove a condition track from a character',
            examples: ['`!remove-condition-track nickname track-name`'],
            args: [
                {
                    key: 'trackname',
                    prompt: 'What is the name of the condition track?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {trackname}) {
        try {

            trackname = trackname.toString().toLowerCase().trim();

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let field = 'conditions.' + trackname;
                let update = { $unset: { [field] : ''} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printCharacter(message, message.author.id, 'condition', 'edit')

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
