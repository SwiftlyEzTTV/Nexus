const { Client, GatewayIntentBits, Events } = require('discord.js');
const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'DirectMessages']
});

const config = {
  owner: process.env.OWNER_ID,
  channels: {
    journal: process.env.JOURNAL_CHANNEL,
    task: process.env.TASK_CHANNEL,
    idea: process.env.IDEA_CHANNEL,
    today: process.env.TODAY_CHANNEL,
    wins: process.env.WINS_CHANNEL
  }
};

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} is online!`);
  
  // Daily 7 AM message
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 7 && now.getMinutes() === 0) {
      const ch = client.channels.cache.get(config.channels.today);
      ch?.send(`☀️ **Good morning!**\n\nTop 3 today:\n1.\n2.\n3.`);
    }
  }, 60000);
});

client.on(Events.MessageCreate, async msg => {
  if (msg.author.id !== config.owner) return;
  if (!msg.content.startsWith('!')) return;

  const args = msg.content.slice(1).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const sendTo = (channelId, text) => {
    const ch = client.channels.cache.get(channelId);
    if (ch) ch.send(text);
  };

  if (cmd === 'j' || cmd === 'journal') {
    sendTo(config.channels.journal, `**${msg.author.tag}** — ${new Date().toLocaleString()}\n${args.join(' ')}`);
    msg.react('✅');
  }
  if (cmd === 't' || cmd === 'task') sendTo(config.channels.task, `➡️ ${args.join(' ')}`);
  if (cmd === 'i' || cmd === 'idea') sendTo(config.channels.idea, `💡 ${args.join(' ')}`);
  if (cmd === 'win') sendTo(config.channels.wins, `🎉 **${args.join(' ')}**`);
});

client.login(process.env.TOKEN);
