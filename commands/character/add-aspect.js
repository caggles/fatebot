const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
const printPretty = require('../../functions/print-pretty')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class AddAspectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-aspect',
            group: 'character',
            memberName: 'add-aspect',
            description: 'add a new aspect to a character',
            examples: ['`!add-aspect`'],
            args: [
                {
                    key: 'aspect',
                    prompt: 'What is the name of the aspect?',
                    type: 'string'
                },
                {
                    key: 'desc',
                    prompt: 'What is the description of the aspect? Enter "none" if you don\'t want to include a description.',
                    type: 'string'
                },
                {
                    key: 'type',
                    prompt: 'What type of aspect are you updating?\nOptions: high, trouble, other',
                    type: 'string',
                    oneOf: ['high concept', 'high', 'hc', 'trouble', 't', 'other']
                }
            ]
        });
    }

    async run(message, {aspect, desc, type}) {
        try {

            aspect = aspect.toString().toLowerCase().trim();
            desc = desc.toString().trim()
            if (desc.toLowerCase() == 'none') {
                desc = '';
            }

            if (type == 'high concept' || type == 'high' || type == 'hc') {
                type = 'high_concept'
            } else if (type == 'trouble' || type == 't') {
                type = 'trouble_aspect'
            }


            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the user's id and guild id, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id}
                let update = ''

                if (type == 'other') {
                    update = { $addToSet: { 'aspects': {name: aspect, desc: desc} } }
                } else if (type == 'high_concept') {
                    update = { $set: {'high_concept': {name: aspect, desc: desc}} }
                } else if (type == 'trouble_aspect') {
                    update = { $set: {'trouble_aspect': {name: aspect, desc: desc}} }
                } else {
                    throw 'That isn\'t a valid aspect type';
                }

                //update the document with the new stunt
                let update_promise = collection.findOneAndUpdate(query, update);
                update_promise.then(function (character) {

                    //print the new character sheet with update info.
                    let print_promise = printPretty(message, message.author.id, 'aspects', 'edit')

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
