const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const utilityCommands = [
  // Uptime
  {
    data: new SlashCommandBuilder()
      .setName('uptime')
      .setDescription('Bot uptime'),
    async execute(interaction) {
      const uptime = interaction.client.uptime;
      const seconds = Math.floor(uptime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      const embed = new EmbedBuilder()
        .setTitle('⏱️ Uptime')
        .setDescription(`${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Server icon
  {
    data: new SlashCommandBuilder()
      .setName('servericon')
      .setDescription('Server icon'),
    async execute(interaction) {
      const icon = interaction.guild.iconURL();
      if (!icon) return interaction.reply({ content: 'No icon!', ephemeral: true });
      
      const embed = new EmbedBuilder()
        .setTitle('🏠 Server Icon')
        .setImage(icon)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Splash
  {
    data: new SlashCommandBuilder()
      .setName('splash')
      .setDescription('Invite splash'),
    async execute(interaction) {
      const splash = interaction.guild.splashURL();
      if (!splash) return interaction.reply({ content: 'No splash!', ephemeral: true });
      
      const embed = new EmbedBuilder()
        .setTitle('🖼️ Splash')
        .setImage(splash)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Banner
  {
    data: new SlashCommandBuilder()
      .setName('banner')
      .setDescription('User banner')
      .addUserOption(o => o.setName('user').setDescription('User')),
    async execute(interaction) {
      const user = interaction.options.getUser('user') || interaction.user;
      const banner = user.bannerURL();
      if (!banner) return interaction.reply({ content: 'No banner!', ephemeral: true });
      
      const embed = new EmbedBuilder()
        .setTitle('🏴 Banner')
        .setImage(banner)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Countdown
  {
    data: new SlashCommandBuilder()
      .setName('countdown')
      .setDescription('Countdown to date')
      .addStringOption(o => o.setName('date').setDescription('Date (YYYY-MM-DD)').setRequired(true)),
    async execute(interaction) {
      const dateStr = interaction.options.getString('date');
      const target = new Date(dateStr);
      const now = new Date();
      const diff = target - now;
      
      if (diff <= 0) return interaction.reply({ content: 'Date must be in the future!', ephemeral: true });
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      const embed = new EmbedBuilder()
        .setTitle('⏰ Countdown')
        .setDescription(`**${dateStr}**\n\n${days}d ${hours}h ${mins}m ${secs}s`)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Invite
  {
    data: new SlashCommandBuilder()
      .setName('invite')
      .setDescription('Bot invite'),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle('🤖 Invite')
        .setDescription('[Add to server](https://discord.com/oauth2/authorize?client_id=YOUR_ID&permissions=8&scope=bot)')
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // IP lookup
  {
    data: new SlashCommandBuilder()
      .setName('ip')
      .setDescription('IP info')
      .addStringOption(o => o.setName('ip').setDescription('IP address').setRequired(true)),
    async execute(interaction) {
      const ip = interaction.options.getString('ip');
      const embed = new EmbedBuilder()
        .setTitle('🌐 IP Info')
        .setDescription(`IP: ${ip}\n\n[Lookup](https://whatismyipaddress.com/${ip})`)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // WhoIs
  {
    data: new SlashCommandBuilder()
      .setName('whois')
      .setDescription('Domain whois')
      .addStringOption(o => o.setName('domain').setDescription('Domain').setRequired(true)),
    async execute(interaction) {
      const domain = interaction.options.getString('domain');
      const embed = new EmbedBuilder()
        .setTitle('🔍 Whois')
        .setDescription(`[Whois for ${domain}](https://whois.domaintools.com/${domain})`)
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Twitch
  {
    data: new SlashCommandBuilder()
      .setName('twitch')
      .setDescription('Twitch status')
      .addStringOption(o => o.setName('channel').setDescription('Channel').setRequired(true)),
    async execute(interaction) {
      const channel = interaction.options.getString('channel');
      const embed = new EmbedBuilder()
        .setTitle('📺 Twitch')
        .setDescription(`[${channel}](https://twitch.tv/${channel})`)
        .setColor(0x9146FE);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // YouTube
  {
    data: new SlashCommandBuilder()
      .setName('youtube')
      .setDescription('YouTube search')
      .addStringOption(o => o.setName('query').setDescription('Query').setRequired(true)),
    async execute(interaction) {
      const query = interaction.options.getString('query');
      const embed = new EmbedBuilder()
        .setTitle('🎬 YouTube')
        .setDescription(`[Search](https://youtube.com/results?search_query=${encodeURIComponent(query)})`)
        .setColor(0xFF0000);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Steam
  {
    data: new SlashCommandBuilder()
      .setName('steam')
      .setDescription('Steam game')
      .addStringOption(o => o.setName('game').setDescription('Game').setRequired(true)),
    async execute(interaction) {
      const game = interaction.options.getString('game');
      const embed = new EmbedBuilder()
        .setTitle('🎮 Steam')
        .setDescription(`[Search](https://store.steampowered.com/search/?term=${encodeURIComponent(game)})`)
        .setColor(0x1B2838);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Play sound
  {
    data: new SlashCommandBuilder()
      .setName('playsound')
      .setDescription('Play sound')
      .addStringOption(o => o.setName('sound').setDescription('Sound').setRequired(true)),
    async execute(interaction) {
      const sound = interaction.options.getString('sound');
      await interaction.reply({ content: `🔊 Playing: ${sound}` });
    },
  },
  
  // Sound list
  {
    data: new SlashCommandBuilder()
      .setName('soundlist')
      .setDescription('Sound list'),
    async execute(interaction) {
      const sounds = ['airhorn', 'cricket', 'danger', 'yeet', 'wow', 'sad', 'vineboom', 'rimshot', 'wrong', 'taco'];
      const embed = new EmbedBuilder()
        .setTitle('🔊 Sounds')
        .setDescription(sounds.map(s => `• ${s}`).join('\n'))
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Voice claim
  {
    data: new SlashCommandBuilder()
      .setName('voiceclaim')
      .setDescription('Claim from AFK')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
    async execute(interaction) {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!member.voice.channel) {
        return interaction.reply({ content: 'User not in voice!', ephemeral: true });
      }
      
      await member.voice.disconnect();
      await interaction.reply({ content: `✅ Claimed ${user.tag} from voice!` });
    },
  },
  
  // Voice move
  {
    data: new SlashCommandBuilder()
      .setName('voicemove')
      .setDescription('Move to voice')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)),
    async execute(interaction) {
      const user = interaction.options.getUser('user');
      const channel = interaction.options.getChannel('channel');
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!channel.isVoiceBased()) {
        return interaction.reply({ content: 'Must be a voice channel!', ephemeral: true });
      }
      
      await member.voice.setChannel(channel);
      await interaction.reply({ content: `✅ Moved ${user.tag} to ${channel}!` });
    },
  },
  
  // Server Info
  {
    data: new SlashCommandBuilder()
      .setName('serverinfo')
      .setDescription('Server info'),
    async execute(interaction) {
      const guild = interaction.guild;
      const embed = new EmbedBuilder()
        .setTitle(guild.name)
        .addFields(
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
          { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
          { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
          { name: 'Created', value: guild.createdAt.toDateString(), inline: true },
        )
        .setThumbnail(guild.iconURL())
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // User Info
  {
    data: new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('User info')
      .addUserOption(o => o.setName('user').setDescription('User')),
    async execute(interaction) {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      
      const embed = new EmbedBuilder()
        .setTitle(user.tag)
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: user.createdAt.toDateString(), inline: true },
          { name: 'Joined', value: member?.joinedAt?.toDateString() || 'N/A', inline: true },
        )
        .setThumbnail(user.displayAvatarURL())
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Avatar
  {
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('User avatar')
      .addUserOption(o => o.setName('user').setDescription('User')),
    async execute(interaction) {
      const user = interaction.options.getUser('user') || interaction.user;
      const embed = new EmbedBuilder()
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(user.displayAvatarURL({ size: 4096 }))
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Role Info
  {
    data: new SlashCommandBuilder()
      .setName('roleinfo')
      .setDescription('Role info')
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)),
    async execute(interaction) {
      const role = interaction.options.getRole('role');
      const embed = new EmbedBuilder()
        .setTitle(role.name)
        .addFields(
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: `#${role.color.toString(16)}`, inline: true },
          { name: 'Position', value: `${role.position}`, inline: true },
          { name: 'Members', value: `${role.members.size}`, inline: true },
        )
        .setColor(role.color);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Channel Info
  {
    data: new SlashCommandBuilder()
      .setName('channelinfo')
      .setDescription('Channel info')
      .addChannelOption(o => o.setName('channel').setDescription('Channel')),
    async execute(interaction) {
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const embed = new EmbedBuilder()
        .setTitle(channel.name)
        .addFields(
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Type', value: channel.type.toString(), inline: true },
          { name: 'Category', value: channel.parent?.name || 'None', inline: true },
        )
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Poll
  {
    data: new SlashCommandBuilder()
      .setName('poll')
      .setDescription('Create poll')
      .addStringOption(o => o.setName('question').setDescription('Question').setRequired(true))
      .addStringOption(o => o.setName('options').setDescription('Options (comma separated)').setRequired(true))
      .addIntegerOption(o => o.setName('duration').setDescription('Duration (minutes)')),
    async execute(interaction) {
      const question = interaction.options.getString('question');
      const options = interaction.options.getString('options').split(',').map(o => o.trim());
      const duration = interaction.options.getInteger('duration');
      
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      
      let description = `**${question}**\n\n`;
      options.forEach((opt, i) => {
        description += `${emojis[i]} ${opt}\n`;
      });
      
      const embed = new EmbedBuilder()
        .setTitle('📊 Poll')
        .setDescription(description)
        .setColor(0x5865F2);
      
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      
      for (let i = 0; i < options.length; i++) {
        await msg.react(emojis[i]);
      }
    },
  },
  
  // Embed
  {
    data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Create embed')
      .addStringOption(o => o.setName('title').setDescription('Title'))
      .addStringOption(o => o.setName('description').setDescription('Description').setRequired(true))
      .addStringOption(o => o.setName('color').setDescription('Color (hex)')),
    async execute(interaction) {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color');
      
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color ? parseInt(color.replace('#', ''), 16) : 0x5865F2);
      
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Weather
  {
    data: new SlashCommandBuilder()
      .setName('weather')
      .setDescription('Weather info')
      .addStringOption(o => o.setName('city').setDescription('City').setRequired(true)),
    async execute(interaction) {
      const city = interaction.options.getString('city');
      await interaction.reply({ content: `Weather lookup for ${city} not implemented yet. Try: https://weather.com` });
    },
  },
  
  // Translate
  {
    data: new SlashCommandBuilder()
      .setName('translate')
      .setDescription('Translate text')
      .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true))
      .addStringOption(o => o.setName('to').setDescription('Target language').setRequired(true)),
    async execute(interaction) {
      const text = interaction.options.getString('text');
      const to = interaction.options.getString('to');
      await interaction.reply({ content: `[Translate "${text}" to ${to}](https://translate.google.com/?sl=auto&tl=${to}&text=${encodeURIComponent(text)})` });
    },
  },
  
  // Wikipedia
  {
    data: new SlashCommandBuilder()
      .setName('wikipedia')
      .setDescription('Wikipedia search')
      .addStringOption(o => o.setName('query').setDescription('Query').setRequired(true)),
    async execute(interaction) {
      const query = interaction.options.getString('query');
      await interaction.reply({ content: `[${query}](https://en.wikipedia.org/wiki/${encodeURIComponent(query)})` });
    },
  },
  
  // GitHub
  {
    data: new SlashCommandBuilder()
      .setName('github')
      .setDescription('GitHub search')
      .addStringOption(o => o.setName('repo').setDescription('Repository').setRequired(true)),
    async execute(interaction) {
      const repo = interaction.options.getString('repo');
      await interaction.reply({ content: `[${repo}](https://github.com/${repo})` });
    },
  },
  
  // NPM
  {
    data: new SlashCommandBuilder()
      .setName('npm')
      .setDescription('NPM package')
      .addStringOption(o => o.setName('package').setDescription('Package').setRequired(true)),
    async execute(interaction) {
      const pkg = interaction.options.getString('package');
      await interaction.reply({ content: `[${pkg}](https://npmjs.com/package/${pkg})` });
    },
  },
  
  // IMDB
  {
    data: new SlashCommandBuilder()
      .setName('imdb')
      .setDescription('IMDB movie')
      .addStringOption(o => o.setName('movie').setDescription('Movie').setRequired(true)),
    async execute(interaction) {
      const movie = interaction.options.getString('movie');
      await interaction.reply({ content: `[${movie}](https://imdb.com/find?q=${encodeURIComponent(movie)})` });
    },
  },
  
  // Crypto
  {
    data: new SlashCommandBuilder()
      .setName('crypto')
      .setDescription('Crypto price')
      .addStringOption(o => o.setName('coin').setDescription('Coin').setRequired(true)),
    async execute(interaction) {
      const coin = interaction.options.getString('coin');
      await interaction.reply({ content: `[${coin}](https://coinmarketcap.com/currencies/${encodeURIComponent(coin)})` });
    },
  },
  
  // Calc
  {
    data: new SlashCommandBuilder()
      .setName('calc')
      .setDescription('Calculate')
      .addStringOption(o => o.setName('expression').setDescription('Expression').setRequired(true)),
    async execute(interaction) {
      const expr = interaction.options.getString('expression');
      try {
        const result = Function('"use strict"; return (' + expr + ')')();
        await interaction.reply({ content: `= ${result}` });
      } catch (e) {
        await interaction.reply({ content: 'Invalid expression!', ephemeral: true });
      }
    },
  },
  
  // Binary
  {
    data: new SlashCommandBuilder()
      .setName('binary')
      .setDescription('Text to binary')
      .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
    async execute(interaction) {
      const text = interaction.options.getString('text');
      let binary = '';
      for (const char of text) {
        binary += char.charCodeAt(0).toString(2).padStart(8, '0') + ' ';
      }
      await interaction.reply({ content: binary });
    },
  },
  
  // QR Code
  {
    data: new SlashCommandBuilder()
      .setName('qrcode')
      .setDescription('Generate QR code')
      .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
    async execute(interaction) {
      const text = interaction.options.getString('text');
      await interaction.reply({ content: `[QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)})` });
    },
  },
  
  // Hastebin
  {
    data: new SlashCommandBuilder()
      .setName('hastebin')
      .setDescription('Share code')
      .addStringOption(o => o.setName('code').setDescription('Code').setRequired(true)),
    async execute(interaction) {
      const code = interaction.options.getString('code');
      await interaction.reply({ content: 'Use https://hastebin.com to share code' });
    },
  },
  
  // AFK
  {
    data: new SlashCommandBuilder()
      .setName('afk')
      .setDescription('Go AFK')
      .addStringOption(o => o.setName('reason').setDescription('Reason')),
    async execute(interaction) {
      const reason = interaction.options.getString('reason') || 'AFK';
      await interaction.reply({ content: `✅ You're now AFK: ${reason}` });
    },
  },
  
  // Image (cat/dog/fox)
  {
    data: new SlashCommandBuilder()
      .setName('cat')
      .setDescription('Random cat'),
    async execute(interaction) {
      await interaction.reply({ content: '🫡 [Cat picture]' });
    },
  },
  
  {
    data: new SlashCommandBuilder()
      .setName('dog')
      .setDescription('Random dog'),
    async execute(interaction) {
      await interaction.reply({ content: '🐕 [Dog picture]' });
    },
  },
  
  {
    data: new SlashCommandBuilder()
      .setName('fox')
      .setDescription('Random fox'),
    async execute(interaction) {
      await interaction.reply({ content: '🦊 [Fox picture]' });
    },
  },
  
  // Shorten URL
  {
    data: new SlashCommandBuilder()
      .setName('shorten')
      .setDescription('Shorten URL')
      .addStringOption(o => o.setName('url').setDescription('URL').setRequired(true)),
    async execute(interaction) {
      const url = interaction.options.getString('url');
      await interaction.reply({ content: `[Shortened](https://is.gd/create.php?url=${encodeURIComponent(url)})` });
    },
  },
  
  // Invite Info
  {
    data: new SlashCommandBuilder()
      .setName('inviteinfo')
      .setDescription('Invite info')
      .addStringOption(o => o.setName('code').setDescription('Code').setRequired(true)),
    async execute(interaction) {
      const code = interaction.options.getString('code');
      await interaction.reply({ content: `[Invite](https://discord.gg/${code})` });
    },
  },
  
  // Ping
  {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Bot ping'),
    async execute(interaction) {
      const ping = interaction.client.ws.ping;
      await interaction.reply({ content: `🏓 Pong! \`${ping}ms\`` });
    },
  },
  
  // Bot stats
  {
    data: new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Bot stats'),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Bot Stats')
        .addFields(
          { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
          { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
          { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
          { name: 'Channels', value: `${interaction.client.channels.cache.size}`, inline: true },
        )
        .setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  
  // Emojis
  {
    data: new SlashCommandBuilder()
      .setName('emojis')
      .setDescription('Server emojis'),
    async execute(interaction) {
      const emojis = interaction.guild.emojis.cache.map(e => e.toString()).join(' ');
      await interaction.reply({ content: emojis || 'No emojis!' });
    },
  },
  
  // Steal Emoji
  {
    data: new SlashCommandBuilder()
      .setName('stealemoji')
      .setDescription('Steal emoji')
      .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true))
      .addStringOption(o => o.setName('name').setDescription('Name')),
    async execute(interaction) {
      const emoji = interaction.options.getString('emoji');
      const name = interaction.options.getString('name') || 'emoji';
      await interaction.reply({ content: `✅ Would steal ${emoji} as ${name}` });
    },
  },
  
  // Jumbo Emoji
  {
    data: new SlashCommandBuilder()
      .setName('jumbo')
      .setDescription('Jumbo emoji')
      .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)),
    async execute(interaction) {
      const emoji = interaction.options.getString('emoji');
      await interaction.reply({ content: `🧐 [Jumbo ${emoji}]` });
    },
  },
];

module.exports = utilityCommands;