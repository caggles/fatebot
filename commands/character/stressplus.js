const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class StressPlusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stress+',
            group: 'character',
            memberName: 'stress+',
            description: 'add stress to your character',
            examples: ['`!stress+ nickname type number`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                },
                {
                    key: 'type',
                    prompt: 'What type of stress are you marking? (This is probably base unless you\'re doing something specific)',
                    type: 'string'
                },
                {
                    key: 'number',
                    prompt: 'How many stress are you marking?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, {nickname, type, number}) {
        try {

            nickname = nickname.toString().toLowerCase().trim();
            type = type.toString().toLowerCase().trim();
            number = parseInt(number);

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};

                //update the document with the new stunt
                let update_promise = collection.findOne(query);
                update_promise.then(function (character) {

                    //finish figuring out how the stress should be passed along.
                    if (type != "base") {
                        let type_total = character["value"]["stress"][type]["total"];
                        if (number > type_total) {
                            number -= type_total;
                        }
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
