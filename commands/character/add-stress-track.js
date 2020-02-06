const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class AddStressTrackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-stress-track',
            group: 'character',
            memberName: 'add-stress-track',
            description: 'add a new stress track to a character',
            examples: ['`!add-stress-track nickname track-name no-of-boxes`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                },
                {
                    key: 'trackname',
                    prompt: 'What is the name of the stress track?',
                    type: 'string'
                },
                {
                    key: 'noofboxes',
                    prompt: 'How many boxes will the stress track have?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, {nickname, trackname, noofboxes}) {
        try {

            nickname = nickname.toString().toLowerCase().trim()
            trackname = trackname.toString().toLowerCase().trim()
            noofboxes = parseInt(noofboxes)

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};
                let field = 'stress.' + trackname;
                let value = { marked: 0, total: noofboxes }
                let update = { $set: { [field] : value} };

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printCharacter(message, message.author.id, character["value"]["nickname"], 'stress')

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
