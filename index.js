const env = require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
const sqlite = require('sqlite');

const client = new Commando.Client({
    commandPrefix: '!',
    owner: process.env.OWNER_ID
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['dice', 'Dice Commands'],
        ['character', 'Character Commands'],
        ['info', 'CoD Information'],
        ['archive', 'Old Archived Commands (not guaranteed to work)']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: true,
        prefix: false,
        ping: true
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	client.user.setActivity('!help');
});

client.login(process.env.BOT_TOKEN);
