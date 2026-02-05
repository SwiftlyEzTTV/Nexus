// Save as index.js
const { Client, GatewayIntentBits, Events, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

// ——— CONFIG ———
const OWNER_ID = '167381665646247936'; // Right-click yourself → Copy ID
const CHANNELS = {
  journal: '1469070514197630977',
  task: '1469069261891702796',
  idea: '1469069763551694981',
  today: '1469068972489052245',
  wins: '1469070773082787911'
};
// ———————————————

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  // Daily 7 AM message
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 7 && now.getMinutes() === 0) {
      const ch = client.channels.cache.get(CHANNELS.today);
      if (ch) ch.send(`☀️ Good morning!\n\nTop 3 today:\n1.\n2.\n3.`);
    }
  }, 60000);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.emoji.name !== '📝' || user.bot) return;
  if (!reaction.message.content) return;
  
  const ch = client.channels.cache.get(CHANNELS.journal);
  if (ch) ch.send(`**${user.tag}** — ${new Date().toLocaleString()}\n${reaction.message.content}`);
});

const commands = [
  new SlashCommandBuilder().setName('journal').setDescription('Log to journal').addStringOption(o => o.setName('entry').setDescription('What happened').setRequired(true)),
  new SlashCommandBuilder().setName('task').setDescription('Quick task').addStringOption(o => o.setName('task').setDescription('Task').setRequired(true)),
  new SlashCommandBuilder().setName('idea').setDescription('Save idea').addStringOption(o => o.setName('idea').setDescription('Idea').setRequired(true)),
  new SlashCommandBuilder().setName('win').setDescription('Log a win').addStringOption(o => o.setName('win').setDescription('What you crushed').setRequired(true)),
  new SlashCommandBuilder().setName('mood').setDescription('Log mood 1-10').addIntegerOption(o => o.setName('score').setDescription('1-10').setRequired(true)).addStringOption(o => o.setName('note').setDescription('Optional note')),
].map(cmd => cmd.toJSON());

client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand() || i.user.id !== OWNER_ID) return;
  
  const entry = i.options.getString('entry') || i.options.getString('task') || i.options.getString('idea') || i.options.getString('win') || i.options.getInteger('score');
  
  try {
    if (i.commandName === 'journal') await client.channels.cache.get(CHANNELS.journal).send(`**${i.user.tag}** — ${new Date().toLocaleString()}\n${entry}`);
    if (i.commandName === 'task') await client.channels.cache.get(CHANNELS.task).send(`➡️ ${entry}`);
    if (i.commandName === 'idea') await client.channels.cache.get(CHANNELS.idea).send(`💡 ${entry}`);
    if (i.commandName === 'win') await client.channels.cache.get(CHANNELS.wins).send(`🎉 **WIN** — ${entry}`);
    if (i.commandName === 'mood') {
      const note = i.options.getString('note') ? ` — ${i.options.getString('note')}` : '';
      await client.channels.cache.get(CHANNELS.journal).send(`😊 Mood: ${entry}/10${note}`);
    }
    await i.reply({ content: 'Logged!', ephemeral: true });
  } catch (e) { await i.reply({ content: 'Error – check channel IDs', ephemeral: true }); }
});

client.login('MTQ2OTA4NzMzMjEzMjE5MjUxMw.GQHru7.eEB6AJq7sjkkBfdMH76I1_gHq2NjwmN4c3Co6s');
