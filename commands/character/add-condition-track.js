const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
const printPretty = require('../../functions/print-pretty')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class AddConditionTrackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-condition-track',
            group: 'character',
            memberName: 'add-condition-track',
            description: 'add a new condition track to a character',
            examples: ['`!add-condition-track track-name no-of-boxes`'],
            args: [
                {
                    key: 'trackname',
                    prompt: 'What is the name of the condition track?',
                    type: 'string'
                },
                {
                    key: 'noofboxes',
                    prompt: 'How many boxes will the condition track have?',
                    type: 'integer'
                },
                {
                    key: 'type',
                    prompt: 'What type is it?\nOptions: fleeting, sticky, lasting',
                    type: 'string',
                    oneOf: ['fleeting', 'sticky', 'lasting']
                }
            ]
        });
    }

    async run(message, {trackname, noofboxes, type}) {
        try {

            trackname = trackname.toString().toLowerCase().trim()
            noofboxes = parseInt(noofboxes)
            type = type.toString().toLowerCase().trim()

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let field = 'conditions.' + trackname;
                let value = { marked: 0, total: noofboxes, type: type }
                let update = { $set: { [field] : value} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printPretty(message, message.author.id,'condition', 'edit')

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
