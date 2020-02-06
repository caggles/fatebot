const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class UpdateRefreshCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'update-refresh',
            group: 'character',
            memberName: 'update-refresh',
            description: 'change your character\'s refresh.',
            examples: ['`!update-mantle`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                },
                {
                    key: 'refresh',
                    prompt: 'What is your new refresh value? This is not an amount to add or remove from your current refresh, this is the new refresh total.',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, {nickname, refresh}) {
        try {

            nickname = nickname.toString().toLowerCase().trim();
            refresh = parseInt(refresh);

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id}
                let update = { $set: {'refresh': refresh} }

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

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
