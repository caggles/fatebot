const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
const printPretty = require('../../functions/print-pretty')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class AddStuntCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-stunt',
            group: 'character',
            memberName: 'add-stunt',
            description: 'add a new stunt to a character',
            examples: ['`!add-stunt`'],
            args: [
                {
                    key: 'stunt',
                    prompt: 'What is the name of the stunt?',
                    type: 'string'
                },
                {
                    key: 'desc',
                    prompt: 'What is the stunt\'s description? Enter "none" if you don\'t want to include a description.',
                    type: 'string'
                },
                {
                    key: 'refresh',
                    prompt: 'Enter the number of refresh to be spent on this stunt: 0 if a core stunt or made a creation, or else 1 in all other cases.',
                    type: "integer",
                    oneOf: [0, 1]
                }
            ]
        });
    }

    async run(message, {stunt, desc, refresh}) {
        try {

            stunt = stunt.toString().toLowerCase().trim()
            desc = desc.toString().trim()
            if (desc == 'none') {
                desc = '';
            }

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let quantity = 0 - refresh
                let update = { $addToSet: { 'stunts': {name: stunt, desc: desc} }, $inc: {'refresh': quantity} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printPretty(message, message.author.id, 'stunts', 'edit')

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
