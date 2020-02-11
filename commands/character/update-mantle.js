const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class UpdateMantleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'update-mantle',
            group: 'character',
            memberName: 'update-mantle',
            description: 'change your character\'s mantle',
            examples: ['`!update-mantle`'],
            args: [
                {
                    key: 'mantle',
                    prompt: 'What is your new mantle called? Note that this does not permit you to add a new mantle if you\'re adding as second one. Enter the entire mantle name at once.',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {mantle}) {
        try {

            mantle = mantle.toString().toLowerCase().trim()


            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id}
                let update = { $set: {'mantle': mantle} }

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
