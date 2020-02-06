const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class FatePlusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fate+',
            group: 'character',
            memberName: 'fate+',
            description: 'add a fate point to your character',
            examples: ['`!fate+ nickname`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, {nickname}) {
        try {

            nickname = nickname.toString().toLowerCase().trim()

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};
                let update = { $inc: {'fate_points': 1} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    if (character["value"] == null) {
                        throw 'That character does not exist.'
                    }

                    //print the new character sheet with update info.
                    let print_promise = printCharacter(message, message.author.id, character["value"]["nickname"], 'base')

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
