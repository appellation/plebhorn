/**
 * Created by Will on 10/9/2016.
 */
const Discord = require('discord.js');
const path = require('path');
require('dotenv').config({
    silent: true,
    path: path.join(__dirname, '/.env')
});
const fs = require('fs');
const queue = require('queue');

const client = new Discord.Client();
const files = [];
console.log(path.join(__dirname, './audio'));
fs.readdir(path.join(__dirname, './audio'), (err, res) => {
    if (err) throw err;
    else if (res.length === 0) throw new Error('no audio found');
    else for (const f of res) files.push(f);
});

client.on('message', msg => {
    if(msg.content !== '!plebhorn' || !msg.member.voiceChannel) return;

    let q;
    if(msg.guild.queue) q = msg.guild.queue;
    else msg.guild.queue = q = queue();

    q.concurrency = 1;

    q.push((cb) => {
        new Promise((resolve, reject) => {
            if(client.voiceConnections.has(msg.guild.id)) resolve(client.voiceConnections.get(msg.guild.id));
            else msg.member.voiceChannel.join().then(resolve).catch(reject);
        }).then(conn => {
            return conn.playFile(path.join(__dirname, '/audio/', files[Math.floor(Math.random() * files.length)]));
        }).then(dispatcher => {
            dispatcher.setVolume(0.5);
            dispatcher.once('end', cb);
        }).catch(console.error)
    });

    if(!msg.guild.queue_started) {
        q.start();

        q.once('end', () => {
            msg.member.voiceChannel.leave();
            msg.guild.queue_started = false;
        });
    }
});

client.on('ready', () => {
    console.log('ready');
});

client.login(process.env.discord_token).catch(console.error);