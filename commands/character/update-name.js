const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class UpdateNameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'update-name',
            group: 'character',
            memberName: 'update-name',
            description: 'change your character\'s name.',
            examples: ['`!update-name`'],
            args: [
                {
                    key: 'name',
                    prompt: 'What is your character\'s new name?',
                    type: 'string'
                },
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s new nickname?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {name, nickname}) {
        try {

            name = name.toString().toLowerCase().trim();
            nickname = nickname.toString().toLowerCase().trim();

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};
                let update = { $set: {'character_name': name, 'nickname': nickname} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printCharacter(message, message.author.id, 'base', 'edit')

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
