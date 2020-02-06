const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class RemoveAspectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove-aspect',
            group: 'character',
            memberName: 'remove-aspect',
            description: 'remove an aspect from a character',
            examples: ['`!remove-aspect`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                },
                {
                    key: 'aspect',
                    prompt: 'What is the name of the aspect? You will need to enter the correct aspect name exactly as it appears on your character sheet.' +
                        '\nNote that you can only remove other aspects - you cannot remove a high concept or trouble aspect. If you want to replace your HC or T aspects, use the `!add-aspect` command.',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {nickname, aspect}) {
        try {

            nickname = nickname.toString().toLowerCase().trim()
            aspect = aspect.toString().toLowerCase().trim()


            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id}
                let update = { $pull: { 'aspects': aspect } }

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printCharacter(message, message.author.id, character["value"]["nickname"], 'aspects')

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
