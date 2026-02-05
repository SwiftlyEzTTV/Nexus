const { Client, GatewayIntentBits, Events, SlashCommandBuilder, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ]
});

client.commands = new Collection();

// === YOUR CHANNEL IDS (hardcoded) ===
const CHANNELS = {
  journal: "1469070514197630977",
  task:    "1469069261891702796",
  idea:    "1469069763551694981",
  wins:    "1469070773082787911",
  today:   "1469071035885289705"
};

// === SLASH COMMANDS ===
const commands = [
  new SlashCommandBuilder()
    .setName('journal')
    .setDescription('Log to your journal')
    .addStringOption(option => option.setName('entry').setDescription('What happened').setRequired(true)),
  new SlashCommandBuilder()
    .setName('task')
    .setDescription('Add a task')
    .addStringOption(option => option.setName('text').setDescription('Task').setRequired(true)),
  new SlashCommandBuilder()
    .setName('idea')
    .setDescription('Save an idea')
    .addStringOption(option => option.setName('text').setDescription('Idea').setRequired(true)),
  new SlashCommandBuilder()
    .setName('win')
    .setDescription('Log a win')
    .addStringOption(option => option.setName('text').setDescription('What you crushed').setRequired(true)),
  new SlashCommandBuilder()
    .setName('mood')
    .setDescription('Log mood 1-10')
    .addIntegerOption(option => option.setName('score').setMinValue(1).setMaxValue(10).setDescription('Mood score').setRequired(true))
    .addStringOption(option => option.setName('note').setDescription('Optional note').setRequired(false))
].map(cmd => cmd.toJSON());

// === READY ===
client.once(Events.ClientReady, async () => {
  console.log(`${client.user.tag} is online!`);

  // Register slash commands
  try {
    await client.application.commands.set(commands);
    console.log('Slash commands registered');
  } catch (e) { console.log('Command register failed:', e.message); }

  // Startup message
  const todayCh = client.channels.cache.get(CHANNELS.today);
  if (todayCh) todayCh.send('Nexus online · All systems stable');

  // Daily 7 AM message
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 7 && now.getMinutes() === 0) {
      const ch = client.channels.cache.get(CHANNELS.today);
      if (ch) ch.send(`☀️ **Good morning!**\n\nTop 3 today:\n1.\n2.\n3.`);
    }
  }, 60000);
});

// === SLASH COMMAND HANDLER ===
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const text = interaction.options.getString('text') || interaction.options.getString('entry') || interaction.options.getString('note') || '';
  const score = interaction.options.getInteger('score');

  try {
    if (commandName === 'journal') await send(CHANNELS.journal, `**${interaction.user.tag}** — ${new Date().toLocaleString()}\n${text || interaction.options.getString('entry')}`);
    if (commandName === 'task') await send(CHANNELS.task, `➡️ ${text}`);
    if (commandName === 'idea') await send(CHANNELS.idea, `💡 ${text}`);
    if (commandName === 'win') await send(CHANNELS.wins, `🎉 **WIN** — ${text}`);
    if (commandName === 'mood') {
      const note = interaction.options.getString('note') ? ` — ${interaction.options.getString('note')}` : '';
      await send(CHANNELS.journal, `😊 Mood: ${score}/10${note}`);
    }

    await interaction.reply({ content: '✅ Logged!', ephemeral: true });
  } catch (e) {
    await interaction.reply({ content: 'Error — check bot permissions', ephemeral: true });
  }
});

async function send(channelId, content) {
  const ch = client.channels.cache.get(channelId);
  if (ch) await ch.send(content);
}

// === PREFIX COMMANDS (!j, !t, etc.) ===
client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('!')) return;

  const args = msg.content.slice(1).trim();
  const cmd = args.split(' ')[0].toLowerCase();
  const content = args.slice(cmd.length).trim();

  if (cmd === 'j' || cmd === 'journal') await send(CHANNELS.journal, `**${msg.author.tag}** — ${new Date().toLocaleString()}\n${content}`);
  if (cmd === 't' || cmd === 'task') await send(CHANNELS.task, `➡️ ${content}`);
  if (cmd === 'i' || cmd === 'idea') await send(CHANNELS.idea, `💡 ${content}`);
  if (cmd === 'win') await send(CHANNELS.wins, `🎉 **WIN** — ${content}`);
});

// === REACTION LOGGING (📝 → journal) ===
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.emoji.name !== '📝' || user.bot) return;
  if (!reaction.message.content) return;

  const ch = client.channels.cache.get(CHANNELS.journal);
  if (ch) ch.send(`**${user.tag}** — ${new Date().toLocaleString()}\n${reaction.message.content}`);
});

// === LOGIN ===
client.login('YOUR_NEW_TOKEN_HERE');  // ← Put your new token here
