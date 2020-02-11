const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class ClearStressCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clear-stress',
            group: 'character',
            memberName: 'clear-stress',
            aliases: ['stress-clear', 'stress-'],
            description: 'clear stress from your character',
            examples: ['`!clear-stress nickname`'],
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

            nickname = nickname.toString().toLowerCase().trim();

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};

                //update the document with the new stunt
                let find_promise = collection.findOne(query);
                find_promise.then(function (character) {

                    let update = '{';
                    for (let stress_type in character.stress) {
                        update += '"stress.' + stress_type + '.marked": 0, '
                    }
                    update = update.substr(0, update.length - 2) + "}";
                    update = JSON.parse(update);
                    update = { $set: update };

                    let update_promise = collection.findOneAndUpdate(query, update);
                    update_promise.then(function (character) {

                        let print_promise = printCharacter(message, message.author.id, character["value"]["nickname"], 'stress')

                    });

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
