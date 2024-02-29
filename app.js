const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions] });
const TOKEN = 'MTIxMjgwMjE3MDI0MDYzNTAyMA.GZUGk3.2WVEc-vkgIWrjQwL7U-k75xYPKbnhhZSVdd4EM'; // Remplace par ton propre token
const TIME_WAITING_BEFORE_CANCEL = 60000

client.on('ready', () => {
  console.log(`[⚙️ ]  Démarrage ...`);
  console.log(`[🟢 ] ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.content === '!impo') {
    console.log(`[✅]  Nouvelle partie`)
    message.channel.send(`🟢 Lancement d'une nouvelle partie ! 🟢`);
    message.channel.send('👋 pour participer !');
    const preparationMsg = await message.channel.send('🎲 pour distribuer les rôles.');
    await preparationMsg.react('👋');
    await preparationMsg.react('🎲');

    const filter = (reaction, user) => !user.bot;
    const collector = preparationMsg.createReactionCollector({ filter, time: TIME_WAITING_BEFORE_CANCEL });

    const participants = new Set();

    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === '👋') {
        participants.add(user);
      } else if (reaction.emoji.name === '🎲' && user.id === message.author.id && participants.size > 0) {
        collector.stop('done');
      }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'done') {
          const randomIndex = Math.floor(Math.random() * participants.size);
          const randomParticipant = [...participants][randomIndex];
      
          await client.users.cache.get(randomParticipant.id).send(`Tu es imposteur ! 👹`)
            .then(() => console.log(`[🗨️ ]  Message envoyé à l'imposteur.`))
            .catch(error => console.error(`[❌ ] Une erreur s'est produite lors de l'envoi du message`));
      
          for (const user of participants) {
            if (user.id !== randomParticipant.id) {
              await client.users.cache.get(user.id).send(`Tu es innocent ! 😇`)
                .then(() => {
                  console.log(`[🗨️ ]  Message envoyé à l'innocent.`);
                })
                .catch(error => console.error(`[❌ ] Une erreur s'est produite lors de l'envoi du message`));
            }
          }
      
          await new Promise(resolve => setTimeout(resolve, 500));

          const tEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
      
          const affichageParticipants = [...participants].map((user, index) => `${tEmojis[index]}  <@${user.id}>`).join('\n');

          const msgAfficher = await message.channel.send(`Voici les participants :\n${affichageParticipants}`);

           for (let i = 0; i < participants.size; i++) {
            await msgAfficher.react(tEmojis[i]);
          }


          const revelationMsg = await message.channel.send(`👀 pour montrer qui est l'imposteur ?`);
          await revelationMsg.react('👀');

          const filter = (reaction, user) => !user.bot;
          const collectorRevelation = revelationMsg.createReactionCollector({ filter });

          collectorRevelation.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '👀' && user.id === message.author.id) {
              collectorRevelation.stop('done');
            }
          });

          collectorRevelation.on('end', async (collected, reason) => {
            if (reason === 'done') {
                message.channel.send(`${randomParticipant} était l'imposteur ! 👹`);
                console.log('[⛔️ ] Fin de la partie')
            }
        })

        } else {
          message.channel.send('⛔️ La partie est annulée, personne n\'a réagi à temps !');
        }
      });
      
  }
});

client.login(TOKEN);
