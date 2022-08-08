/////////////////
//configuration//
/////////////////

const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const { getLyrics } = require('genius-lyrics-api');
const Discord = require("discord.js");
const DisTube = require("distube");
const radio = require("./radio");
const config = {
    Lavalink: {
        id: "Main",
        host: "lava.link",
        port: 80,
        pass: "youshallnotpass",
    },
    PREFIX: "hm" + " ",
    token: "MTAwMjM1MTQ3OTE1MzI1MDMyNw.GxRFuR.2VAYFNJO9fSsgJuE2u9eVR1_UBouWZ8C5JdQRk",
    geniusapi: 'zjriw-pYm1g6_Eg3_aPc0_0Cx5IlxedyT3ya3yB4XqEbbnYZT8T5vG7dc9x75scD'
}
const client = new Discord.Client({ disableMentions: "all" });
const distube = new DisTube(client, {
    youtubeCookie: "",
    searchSongs: true,
    emitNewSongOnly: true,
    highWaterMark: 1 << 25,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    customFilters:
    {
        "clear": "dynaudnorm=f=200",
        "bassboost": "bass=g=20,dynaudnorm=f=200",
        "8d": "apulsator=hz=0.08",
        "vaporwave": "aresample=48000,asetrate=48000*0.8",
        "nightcore": "aresample=48000,asetrate=48000*1.25",
        "phaser": "aphaser=in_gain=0.4",
        "purebass": "bass=g=20,dynaudnorm=f=200,asubboost",
        "tremolo": "tremolo",
        "vibrato": "vibrato=f=6.5",
        "reverse": "areverse",
        "treble": "treble=g=5",
        "surrounding": "surround",
        "pulsator": "apulsator=hz=1",
        "subboost": "asubboost",
        "karaoke": "stereotools=mlev=0.03",
        "flanger": "flanger",
        "gate": "agate",
        "haas": "haas",
        "mcompand": "mcompand"
    }
})
let stateswitch = false;
let emojis = [
    "🎼",
    "🎹",
    "🎙",
    "👍",
    "🎧",
    "🎶",
    "🎵"
];
const filters = [
    "mcompand",
    "gate",
    "haas",
    "pulsator",
    "surrounding",
    "clear",
    "8d",
    "bassboost",
    "echo",
    "karaoke",
    "nightcore",
    "vaporwave",
    "flanger",
    "subboost",
    "phaser",
    "tremolo",
    "vibrato",
    "reverse",
    "purebass",
    "treble"
];
/////////////////
//////Events/////
/////////////////
client.login(config.token); //start the bot
//log when ready and status
client.on("ready", () => {
    console.log(`${client.user.tag} has logged in.`);
    client.user.setPresence({ status: "do not disturb" }); //change to online

    setInterval(() => {
        stateswitch = !stateswitch; //change state
        if (stateswitch) client.user.setActivity(`to ${client.guilds.cache.size} Servers`, { type: "STREAMING", url: "https://www.twitch.tv/nocopyrightsounds" });
        else client.user.setActivity(`${client.guilds.cache.reduce((c, g) => c + g.memberCount, 0)} Users`, { type: "LISTENING" });
    }, 5000); //5 second delay
})
//log when reconnect
client.on('reconnecting', () => {
    console.log('🔁 Reconnecting...');
    client.user.setPresence({ status: "offline" }); //change to offline
});
//log when disconnecting
client.on('disconnect', () => {
    console.log('😓 Disconnected!');
    client.user.setPresence({ status: "offline" }); //change to offline
});

client.on("guildMemberAdd", (member) => {
    console.log(`"${member.user.username}" has joined "${member.guild.name}!"`);
    member.guild.channels.cache.find(c => c.name === "welcome").send(`👋"${member.user.username}" has joined this server. Welcome!`);
});

client.on("guildCreate", guild => {
    const channels = guild.channels.cache.filter(channel => channel.type == "text");
    const embed = new Discord.MessageEmbed()
        .setDescription("**👋 Hello! I am Hyacinth's Music, known as Hya-Music! Thank you for inviting me to your server.** My default prefix is `hm!`, you can change this at anytime with hm!prefix \`<prefix>\`. To get started, please run \`hm!help\`!")
        .setTimestamp()
        .setColor("#061244")
    channels.first().send(embed).catch(e => console.log(e));
});


client.on("message", async message => {
    if (message.author.bot) return; //if a bot return 
    if (!message.guild) return;     //if not in a guild return

    let prefix = await db.get(`prefix_${message.guild.id}`)//getting prefix 
    if (prefix === null) prefix = config.PREFIX;           //if not prefix set it to standard prefix in the config.json file

    const args = message.content.slice(prefix.length).trim().split(/ +/g); //arguments of the content
    const command = args.shift();                                          //defining the command msgs

    if (message.content.includes(client.user.id)) { //if message contains musicium as a ping
        return message.reply(new Discord.MessageEmbed().setColor("#061244").setAuthor(`${message.author.username}, My Prefix is ${prefix}, to get started; type ${prefix}help`, message.author.displayAvatarURL({ dynamic: true }), "https://harmonymusic.tk"));
    }
    if (message.content.startsWith(prefix)) { //if its a command react with a random emoji
        let random = getRandomInt(8);         //get the actual random number
        message.react(emojis[random]);        //react with the emoji
    }
    else { //if not a command skip
        return;
    }
    ///////////////////
    /////COMMANDS//////
    ///////////////////
    try {

        if (command === "invite" || command === "add") {
            return embedbuilder(client, message, "#061244", "Invitation Link", "**(https://discord.com/api/oauth2/authorize?client_id=1002351479153250327&permissions=49572160&scope=bot)**")
        }
        if (command === "radio") {
            return radio(client, message, args); //get the radio module
        }
        if (command === "help" || command === "about" || command === "h" || command === "info") {
            let helpembed = new Discord.MessageEmbed()
                .setColor("#061244")
                .setTitle("Available Commands")
                .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
                .setFooter(client.user.username + " KEY: <> - Must include /  [] -  Optional", client.user.displayAvatarURL())
                .setDescription(`
        **Prefix:** \`${prefix}\`, *Change With:* \`${prefix}prefix <NEW PREFIX>\`

        \`${prefix}help\`  Alias:\`${prefix}h\`  💠 **List of all Commands.**
        \`${prefix}play <URL/NAME>\`  Alias:\`${prefix}p\`  💠 **Plays a song.**
        \`${prefix}radio [radiostation]\`  💠 **Plays a radiostation.**
        \`${prefix}status\`  💠 **Shows queue status.**
        \`${prefix}nowplaying\`  Alias:\`${prefix}np\`  💠 **Shows current song.**
        \`${prefix}pause\`  💠 **Pauses the current song.**
        \`${prefix}resume\` Alias:\`${prefix}r\`  💠 **Resume the song.**
        \`${prefix}shuffle\`  Alias:\`${prefix}mix\`  💠 **Shuffles the queue.**
        \`${prefix}playskip\`  Alias:\`${prefix}ps\`  💠 **Plays new song and skips current.**
        \`${prefix}autoplay\`  Alias:\`${prefix}ap\`  💠 **Enables autoplay - random similar songs.**
        \`${prefix}skip\`  Alias:\`${prefix}s\`  💠 **Skips current song.**
        \`${prefix}stop\`  Alias:\`${prefix}leave\`  💠 **Stops playing any tracks and leaves the channel.**
        \`${prefix}seek <DURATION>\`  💠 **Jump to a specific time.**
        \`${prefix}volume <VOLUME>\`  Alias:\`${prefix}vol\`  💠 **Changes volume.**
        \`${prefix}queue\`  Alias:\`${prefix}qu\`  💠 **Shows current Queue.**
        \`${prefix}loop <0/1/2>\`  Alias:\`${prefix}mix\`  💠 **Enables loop for off / song / queue.**
        \`${prefix}lyrics\`   Alias:\`${prefix}ly\`  💠 **Shows lyrics for this song.**
        \`${prefix}jump <QUEUE NUMBER>\`  💠 **Jumps to a queue song**
        \`${prefix}prefix <PREFIX>\` 💠 *Changes the prefix*.
        \`${prefix}ping\`  💠 **Displays current ping.**
        \`${prefix}uptime\`  💠 **Displays my uptime.**
        \`${prefix}invite\`  💠 **Invite me to your server.**
        `)
                .addField("**✨ Filter Commands:**", `
        \`${prefix}gate\` | \`${prefix}haas\` | \`${prefix}pulsator\` | \`${prefix}surrounding\` | \`${prefix}clear\` | \`${prefix}8d\` | \`${prefix}bassboost\` | \`${prefix}echo\` | \`${prefix}karaoke\` | \`${prefix}nightcore\` | \`${prefix}vaporwave\` | \`${prefix}flanger\` | \`${prefix}subboost\` | \`${prefix}phaser\` | \`${prefix}tremolo\` | \`${prefix}vibrato\` | \`${prefix}reverse\` | \`${prefix}treble\` | \`${prefix}clear\`   
        `)
                .addField("**SUPPORTED SOURCES:**", `
        \`Youtube\` + \`Soundcloud\`
        `)
            message.channel.send(helpembed)
            return;
        }
        else if (command === "prefix") {

            let prefix = await db.get(`prefix_${message.guild.id}`)

            if (prefix === null) prefix = config.PREFIX;

            message.react("✅");

            if (!args[0]) return embedbuilder(client, message, "RED", "❌ Current Prefix: \`${prefix}\`", `Please provide a new prefix.`)


            if (!message.member.hasPermission("ADMINISTRATOR")) return embedbuilder(client, message, "RED", "PREFIX", `❌ You do not have permissions to use this command.`)


            if (args[1]) return embedbuilder(client, message, "RED", "PREFIX", `'❌ The prefix may not have two spaces.'`)

            db.set(`prefix_${message.guild.id}`, args[0])

            return embedbuilder(client, message, "#061244", "PREFIX", `✅ Set prefix to **\`${args[0]}\`**.`)
        }
        else if (command === "search") {

            embedbuilder(client, message, "#061244", "🔎 Searching...", args.join(" "))

            let result = await distube.search(args.join(" "));

            let searchresult = "";

            for (let i = 0; i <= result.length; i++) {
                try {
                    searchresult += await `**${i + 1}**. ${result[i].name} - \`${result[i].formattedDuration}\`\n`;
                } catch {
                    searchresult += await " ";
                }
            }
            let searchembed = await embedbuilder(client, message, "#061244", "🎧 **Current Queue**", searchresult)

            let userinput;

            await searchembed.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"], }).then(collected => {
                userinput = collected.first().content;
                if (isNaN(userinput)) {
                    embedbuilder(client, message, "RED", "❌ Not a right number", "Number#1 will be used.")
                    userinput = 1;
                }
                if (Number(userinput) < 0 && Number(userinput) >= 15) {
                    embedbuilder(client, message, "RED", "❌ Not a right number.", "Number#1 will be used.")
                    userinput = 1;
                }
                searchembed.delete({ timeout: Number(client.ws.ping) });
            }).catch(() => { console.log(console.error); userinput = 404 });
            if (userinput === 404) {
                return embedbuilder(client, message, "RED", "Something went wrong!")
            }
            embedbuilder(client, message, "#061244", "Searching!", `[${result[userinput - 1].name}](${result[userinput - 1].url})`, result[userinput - 1].thumbnail)
            return distube.play(message, result[userinput - 1].url)
        }
        else if (command == "status") {
            let queue = distube.getQueue(message);
            if (!queue) return embedbuilder(client, message, "RED", "There is nothing playing!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            const status = `Volume: \`${queue.volume}\` | Filter: \`${queue.filter || "❌"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
            return embedbuilder(client, message, "#061244", "Current status:", status)
        }
        else if (command == "np" || command === "nowplaying") {
            let queue = distube.getQueue(message);
            if (!queue) return embedbuilder(client, message, "RED", "There is nothing playing!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            let cursong = queue.songs[0];

            return embedbuilder(client, message, "#061244", "Current Song!", `[${cursong.name}](${cursong.url})\n\nPlaying for: \`${(Math.floor(queue.currentTime / 1000 / 60 * 100) / 100).toString().replace(".", ":")} Minutes\`\n\nDuration: \`${cursong.formattedDuration}\``, cursong.thumbnail)
        }
        else if (command == "pause") {
            embedbuilder(client, message, "#061244", "Paused!")
            return distube.pause(message);
        }
        else if (command == "resume" || command == "r") {
            embedbuilder(client, message, "#061244", "Resume!")
            return distube.resume(message);
        }
        else if (command == "shuffle" || command == "mix") {
            embedbuilder(client, message, "#061244", "Shuffled!")
            return distube.shuffle(message);
        }
        else if (command == "lyrics" || command == "ly") {

            let queue = distube.getQueue(message);

            if (!queue) return embedbuilder(client, message, "RED", "❌ There is nothing playing.").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            let cursong = queue.songs[0];
            embedbuilder(client, message, "#99aab5", "🔎 Searching..").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            const options = {
                apiKey: config.geniusapi,
                title: cursong.name,
                artist: cursong.info.videoDetails.author.name,
                optimizeQuery: true
            };

            getLyrics(options).then(async (lyrics) => {

                let embed = new Discord.MessageEmbed()
                    .setDescription("❌ No lyrics found!")
                    .setColor("ff0000")
                if (!lyrics || lyrics === null || lyrics === "null") return message.channel.send(embed)

                let currentPage = 0;
                const embeds = lyricsEmbed(message, lyrics, cursong);

                const queueEmbed = await message.channel.send(
                    `**Current Page - ${currentPage + 1}/${embeds.length}**`,
                    embeds[currentPage]
                );

                try {
                    await queueEmbed.react("⬅️");
                    await queueEmbed.react("⏹");
                    await queueEmbed.react("➡️");
                } catch (error) {
                    console.error(error);
                    message.channel.send(error.message).catch(console.error);
                }

                const filter = (reaction, user) =>
                    ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
                const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

                collector.on("collect", async (reaction, user) => {
                    try {
                        if (reaction.emoji.name === "➡️") {
                            if (currentPage < embeds.length - 1) {
                                currentPage++;
                                queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                            }
                        } else if (reaction.emoji.name === "⬅️") {
                            if (currentPage !== 0) {
                                --currentPage;
                                queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                            }
                        } else {
                            collector.stop();
                            reaction.message.reactions.removeAll();
                        }
                        await reaction.users.remove(message.author.id);
                    } catch (error) {
                        console.error(error);
                        return message.channel.send(error.message).catch(console.error);
                    }
                });

            });
        }
        else if (command == "playskip" || command == "ps") {
            embedbuilder(client, message, "GREEN", "🔎 + 👉 Searching, and Skipping..", args.join(" "))
            try {
                await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).delete().catch(console.error);
            } catch (error) {
                console.error(error)

            }
            return distube.playSkip(message, args.join(" "));
        }
        else if (command == "autoplay" || command == "ap") {
            await embedbuilder(client, message, "#061244", `Autoplay is now on ${distube.toggleAutoplay(message) ? "ON" : "OFF"}!`)
            await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
            await delay(5000);

            await message.channel.bulkDelete(2)
            return
            return;
        }

        if (command == "playspotify" || command == "pys") {
            //do things for spotify track
            if (args.join(" ").includes("track") && args.join(" ").includes("open.spotify")) {
                //get data
                let info = await getPreview(args.join(" "));
                //play track
                return distube.play(message, info.artist + " " + info.title);
            }

            //do things for spotify playlist
            else if (args.join(" ").includes("playlist") && args.join(" ").includes("open.spotify")) {
                let items = await getTracks(args.join(" "));
                let songsarray = [];
                let tracklength = items.length;
                if (tracklength > 100) {
                    const embed = new Discord.MessageEmbed()
                        .setDescription("The maximum track amount I can play is 100.")
                        .setColor("RED")
                    message.reply(embed);
                    tracklength = 100;
                }
                functions.embedbuilder(client, 5000, message, "🎶  Fetching the songs!", "This will take me around about: " + tracklength / 2 + " seconds");
                for (let i = 0; i < 100; i++) {
                    let result = await distube.play(items[i].title);
                    songsarray.push(result[0].url)
                }
                distube.playCustomPlaylist(message, songsarray, {
                    name: message.author.username + "'s Spotify Playlist"
                });
            }

            //just play it
            else {
                return distube.play(message, args.join(" "));
            }
        }

        else if (command === "ping") {
            return embedbuilder(client, message, `RED`, `PING:`, `\`${client.ws.ping} ms\``)
        }
        else if (command === "uptime") {
            let days = Math.floor(client.uptime / 86400000);
            let hours = Math.floor(client.uptime / 3600000) % 24;
            let minutes = Math.floor(client.uptime / 60000) % 60;
            let seconds = Math.floor(client.uptime / 1000) % 60;
            return embedbuilder(client, message, `GREEN`, `UPTIME:`, `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``)
        }
        else if (command === "play" || command === "p") {
            embedbuilder(client, message, "99aab5", "🔎 Searching...", args.join(" ")).then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
            return distube.play(message, args.join(" "));
        }
        else if (command === "skip" || command === "s") {
            embedbuilder(client, message, "RED", `SKIPPED!`).then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
            try {
                await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).delete().catch(console.error);
            } catch (error) {
                console.error(error)
            }
            return distube.skip(message);
        }
        else if (command === "stop" || command === "leave") {
            embedbuilder(client, message, "RED", "🛑 STOPPED!", `The current queue has been stopped. I have left the current channel.`).then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
            try {
                await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).delete().catch(console.error);
            } catch (error) {
                console.error(error)

            }
            return distube.stop(message);
        }
        else if (command === "seek") {
            await embedbuilder(client, message, "GREEN", `✅ Seeked the song to \`${args[0]} seconds\``)
            await distube.seek(message, Number(args[0] * 1000));
            await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
            await delay(5000);
            await message.channel.bulkDelete(2)
            return
        }
        else if (filters.includes(command)) {
            let filter = await distube.setFilter(message, command);
            await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
            await embedbuilder(client, message, "#061244", "Adding filter!", filter)
            await delay(500);
            await message.channel.bulkDelete(2)
            return
        }
        else if (command === "volume" || command === "vol") {

            embedbuilder(client, message, "GREEN", `✅ Changed the volume to \`${args[0]} %\`!`)
            await distube.setVolume(message, args[0]);
            await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
            await delay(5000);
            await message.channel.bulkDelete(2)
            return
        }
        else if (command === "queue" || command === "qu") {

            let currentPage = 0;
            let queue = distube.getQueue(message);
            if (!queue) return embedbuilder(client, message, "RED", "❌ There is nothing playing.").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            const embeds = QueueEmbed(queue.songs);
            const queueEmbed = await message.channel.send(`
        **Current Page - ${currentPage + 1}/${embeds.length}**`,
                embeds[currentPage]);
            try {
                await queueEmbed.react("⬅️");
                await queueEmbed.react("⏹");
                await queueEmbed.react("➡️");
            } catch (error) {
                console.error(error)

            }
            const filter = (reaction, user) =>
                ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
            const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });
            collector.on("collect", async (reaction, user) => {
                try {
                    if (reaction.emoji.name === "➡️") {
                        if (currentPage < embeds.length - 1) {
                            currentPage++;
                            queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                    } else if (reaction.emoji.name === "⬅️") {
                        if (currentPage !== 0) {
                            --currentPage;
                            queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                    } else {
                        collector.stop();
                        reaction.message.reactions.removeAll();
                    }
                    await reaction.users.remove(message.author.id);
                } catch (error) {
                    console.error(error)

                }
            })
        }
        else if (command === "loop" || command === "repeat") {
            if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
                await distube.setRepeatMode(message, parseInt(args[0]));
                await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
                await embedbuilder(client, message, "GREEN", "✅ Repeat mode set to:", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
                await delay(5000);
                await message.channel.bulkDelete(2)
                return
            }
            else {
                return embedbuilder(client, message, "RED", `❌ Please use a number between **0** and **2** | *(0: ❌ Disabled, 1: 🔂 Repeat a Song, 2: 🔁 Repeat Queue)*`)
            }

        }
        else if (command === "jump") {
            let queue = distube.getQueue(message);
            if (!queue) return embedbuilder(client, message, "RED", "❌ There is nothing playing.").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

            if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
                embedbuilder(client, message, "GREEN", `✅ I have jumped ${parseInt(args[0])} songs!`)
                try {
                    await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).delete().catch(console.error);
                } catch (error) {
                    console.error(error)

                }
                return distube.jump(message, parseInt(args[0]))
                    .catch(err => message.channel.send("Invalid song number."));
            }
            else {
                return embedbuilder(client, message, "RED", `❌ Please enter a number between **0** and **${DisTube.getQueue(message).length}** | *(0: ❌ Disabled, 1: 🔂 Repeat a song, 2: 🔁 Repeat Queue)*`)
            }

        }
        else if (message.content.startsWith(prefix)) {
            return embedbuilder(client, message, "RED", "❓ Unknown Command", `Type ${prefix}help to see all available commands!`)
        }

    } catch (error) {
        console.error
    }
})
///////////////
////DISTUBE////
///////////////
distube
    .on("playSong", async (message, queue, song) => {
        try {
            playsongyes(message, queue, song);
        } catch (error) {
            console.error
        }
    })
    .on("addSong", (message, queue, song) => {
        try {
            return embedbuilder(client, message, "#061244", "Added a Song!", `Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\` \n\nRequested by: ${song.user}\n\nEstimated Time: ${queue.songs.length - 1} song(s) - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`\nQueue duration: \`${queue.formattedDuration}\``, song.thumbnail)
        } catch (error) {
            console.error
        }
    })
    .on("playList", (message, queue, playlist, song) => {
        try {
            playplaylistyes(message, queue, playlist, song);
        } catch (error) {
            console.error
        }
    })
    .on("addList", (message, queue, playlist, song) => {
        try {
            return embedbuilder(client, message, "  GREEN", "✅ Added a Playlist!", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${song.user}`, playlist.thumbnail)
        } catch (error) {
            console.error
        }
    })
    .on("searchResult", (message, result) => {
        try {
            let i = 0;
            return embedbuilder(client, message, "GREEN", "", `**Choose an option from below**\n${result.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
        } catch (error) {
            console.error
        }
    })
    .on("searchCancel", (message) => {
        try {
            message.reactions.removeAll();
            message.react("❌")
        } catch (error) {
            console.error(error)

        }
        try {
            return embedbuilder(client, message, "RED", `❌ Searching cancelled.`, "").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("error", (message, err) => {
        try {
            message.reactions.removeAll();
            message.react("❌")
        } catch (error) {
            console.error(error)
        }
        console.log(err);
        try {
            return embedbuilder(client, message, "RED", "An error encountered:", "```" + err + "```")
        } catch (error) {
            console.error
        }
    })
    .on("finish", message => {
        try {
            return embedbuilder(client, message, "RED", "❌ There are no more songs that I can play.").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("empty", message => {

        try {
            return embedbuilder(client, message, "RED", "❌ The channel was empty, so I left").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("noRelated", message => {
        try {
            return embedbuilder(client, message, "RED", "❌ I cannot find a related video to play").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("initQueue", queue => {
        try {
            queue.autoplay = false;
            queue.volume = 100;
            queue.filter = filters[5];
        } catch (error) {
            console.error
        }
    });

///////////////
///FUNCTIONS///
///////////////
//function embeds creates embeds
function embedbuilder(client, message, color, title, description, thumbnail) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
            .setFooter(client.user.username, client.user.displayAvatarURL());
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (thumbnail) embed.setThumbnail(thumbnail)
        return message.channel.send(embed);
    } catch (error) {
        console.error
    }
}

//this function is for playing the song
async function playsongyes(message, queue, song) {
    try {
        let embed1 = new Discord.MessageEmbed()

            .setColor("GREEN")
            .setTitle("Playing Song!")
            .setDescription(`Song: [\`${song.name}\`](${song.url})`)
            .addField("⏱ Duration:", ` \`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, true)
            .addField("🌀 Queue:", `\`${queue.songs.length} song(s) - ${queue.formattedDuration}\``, true)
            .addField("🔊 Volume:", `\`${queue.volume} %\``, true)
            .addField("♾ Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? "✅ Queue" : "✅ Song" : "❌"}\``, true)
            .addField("↪️ Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
            .addField("❔ Filter:", `\`${queue.filter || "❌"}\``, true)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(song.thumbnail)

        var playingMessage = await message.channel.send(embed1)

        db.set(`playingembed_${message.guild.id}`, playingMessage.id)
        db.set(`playingchannel_${message.guild.id}`, message.channel.id)
        try {
            await playingMessage.react("⏭");
            await playingMessage.react("⏹");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("◀️");
            await playingMessage.react("▶️");
        }
        catch (error) {
            const jjembed = new Discord.MessageEmbed()
                .setDescription("❌ I am missing permissions to react to messages!")
                .setColor("ff0000")
            message.reply(jjembed)
            console.log(error);
        }

        const filter = (reaction, user) =>
            ["⏭", "⏹", "🔉", "🔊", "◀️", "▶️"].includes(reaction.emoji.name) && user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        collector.on("collect", async (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);
            if (member.voice.connection && member.voice.connection !== member.guild.me.voice.connection) return;

            switch (reaction.emoji.name) {
                case "⏭":
                    distube.skip(message);
                    embedbuilder(client, message, "GREEN", `✅ Skipped the song.`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    playingMessage.reactions.removeAll().catch(console.error);
                    playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
                    break;

                case "⏹":
                    distube.stop(message);
                    playingMessage.reactions.removeAll().catch(console.error);
                    playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
                    embedbuilder(client, message, "RED", "🛑 STOPPED", `I have left the channel.`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "🔉":

                    reaction.users.remove(user).catch(console.error);
                    await distube.setVolume(message, Number(queue.volume) - 10);
                    embedbuilder(client, message, "GREEN", `✅ Reduced the volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    await playingMessage.edit(curembed(message)).catch(console.error);
                    break;

                case "🔊":

                    reaction.users.remove(user).catch(console.error);
                    await distube.setVolume(message, Number(queue.volume) + 10);
                    embedbuilder(client, message, "GREEN", `✅ Raised the volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    await playingMessage.edit(curembed(message)).catch(console.error);
                    break;

                case "◀️":

                    reaction.users.remove(user).catch(console.error);
                    let seektime = queue.currentTime - 10000;
                    if (seektime < 0) seektime = 0;
                    await distube.seek(message, Number(seektime));
                    playingMessage.edit(curembed(message)).catch(console.error);
                    embedbuilder(client, message, "GREEN", `✅ Seeked the song for \`-10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))

                    break;

                case "▶️":
                    reaction.users.remove(user).catch(console.error);
                    let seektime2 = queue.currentTime + 10000;
                    if (seektime2 >= queue.songs[0].duration * 1000) { seektime2 = queue.songs[0].duration * 1000 - 1; }
                    console.log(seektime2)
                    await distube.seek(message, seektime2);
                    playingMessage.edit(curembed(message)).catch(console.error);
                    embedbuilder(client, message, "GREEN", `✅ Seeked the song for \`+10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
        })
    } catch (error) {
        console.error
    }
}

//this function is for playlistsong playing like the function above
async function playplaylistyes(message, queue, playlist, song) {
    try {
        var playingMessage = await embedbuilder(client, message, "GREEN", "✅ Playling Playlist", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${song.user}\n\nVolume: \`${queue.volume} %\`\nLoop: \`${queue.repeatMode ? "On" : "Off"}\`\nAutoplay: \`${queue.autoplay ? "On" : "Off"}\`\nFilter: \`${queue.filter || "❌"}\``, playlist.thumbnail)
        await playingMessage.react("⏭");
        await playingMessage.react("⏹");
        await playingMessage.react("🔉");
        await playingMessage.react("🔊");
        await playingMessage.react("◀️");
        await playingMessage.react("▶️");
    }
    catch {
        console.error(error);
    }
    try {
        const filter = (reaction, user) =>
            ["⏭", "⏹", "🔉", "🔊", "◀️", "▶️"].includes(reaction.emoji.name) && user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        collector.on("collect", (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);
            if (member.voice.connection && member.voice.connection !== member.guild.me.voice.connection) return;

            switch (reaction.emoji.name) {

                case "⏭":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", `🚫 Skipped the song.`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    distube.skip(message);
                    break;

                case "⏹":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", `❌ I have left the channel.`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    distube.stop(message);
                    break;

                case "🔉":
                    reaction.users.remove(user).catch(console.error);
                    distube.setVolume(message, Number(queue.volume) - 10);
                    embedbuilder(client, message, "RED", `👇 Reduced the volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "🔊":
                    reaction.users.remove(user).catch(console.error);
                    distube.setVolume(message, Number(queue.volume) + 10);
                    embedbuilder(client, message, "GREEN", `✅ Raised the volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "◀️":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "GREEN", `✅ Seeked the song to \`-10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    let seektime = queue.currentTime - 10000;
                    if (seektime < 0) seektime = 0;
                    distube.seek(message, Number(seektime));
                    break;

                case "▶️":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "GREEN", `✅ Seeked the song to \`+10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    let seektime2 = queue.currentTime + 10000;
                    console.log(seektime2);
                    if (seektime2 > queue.songs[0].duration) seektime2 = queue.songs[0].duration - 1;
                    distube.seek(message, Number(seektime2));
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
        })
    } catch (error) {
        console.error
    }
}

//this function is for embed editing for the music info msg
function curembed(message) {
    try {
        let queue = distube.getQueue(message); //get the current queue
        let song = queue.songs[0];
        embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle(`✅ Now Playing ${song.name} `)
            .setDescription(`Song: [\`${song.name}\`](${song.url})`)
            .addField("⏱ Duration:", `\`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, true)
            .addField("🎧 Queue:", `\`${queue.songs.length} song(s) - ${queue.formattedDuration}\``, true)
            .addField("🔊 Volume:", `\`${queue.volume} %\``, true)
            .addField("♾ Loop:", `\`${queue.repeatMode ? queue.repeatMode === 2 ? "✅ Queue" : "✅ Song" : "❌"}\``, true)
            .addField("↪️ Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
            .addField("✨ Filter:", `\`${queue.filter || "❌"}\``, true)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(song.thumbnail)
        return embed; //sending the new embed back
    } catch (error) {
        console.error
    }
}

//this function is for current Queue
function QueueEmbed(queue) {
    try {
        let embeds = [];
        let k = 10;
        //defining each Pages
        for (let i = 0; i < queue.length; i += 10) {
            const current = queue.slice(i, k)
            let j = i;
            k += 10;
            const info = current.map((track) => `**${++j} -** [\`${track.name}\`](${track.url})`).join("\n")
            const embed = new Discord.MessageEmbed()
                .setTitle("✨ Server Queue")
                .setColor("YELLOW")
                .setDescription(`**Current Song - [\`${queue[0].name}\`](${queue[0].url})**\n\n${info}`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
            embeds.push(embed);
        }
        //returning the Embed
        return embeds;
    } catch (error) {
        console.error
    }

}

//this function is for lyrics embed
function lyricsEmbed(message, lyrics, song) {
    try {
        let embeds = [];
        let k = 1000;

        for (let i = 0; i < lyrics.length; i += 1000) {
            const current = lyrics.slice(i, k);
            let j = i;
            k += 1000;
            const embed = new Discord.MessageEmbed()
                .setTitle("🎶 Lyrics - " + song.name)
                .setURL(song.url)
                .setThumbnail(song.thumbnail)
                .setColor("PURPLE")
                .setDescription(current)
            embeds.push(embed);
        }
        return embeds;
    } catch (error) {
        console.error
    }
}

/////////////
///GENERAL///
/////////////
//this function is for delaying stuff if needed
function delay(delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}

//this function is for getting a random number
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
