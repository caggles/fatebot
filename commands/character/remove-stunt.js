const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
const printPretty = require('../../functions/print-pretty')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class RemoveStuntCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove-stunt',
            group: 'character',
            memberName: 'remove-stunt',
            description: 'remove a stunt from your character',
            examples: ['`!remove-stunt`'],
            args: [
                {
                    key: 'stunt',
                    prompt: 'What is the name of the stunt? You will need to enter the correct stunt name exactly as it appears on your character sheet.',
                    type: 'string'
                },
                {
                    key: 'refresh',
                    prompt: 'Enter the number of refresh you\'re regaining from the removal of this stunt. The only valid choices are 0 or 1.',
                    type: "integer",
                    oneOf: [0, 1]
                }
            ]
        });
    }

    async run(message, {stunt, refresh}) {
        try {

            stunt = stunt.toString().toLowerCase().trim()


            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let update = { $pull: { 'stunts': stunt }, $inc: {'refresh': refresh} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printPretty(message, message.author.id,'stunts', 'edit')

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
