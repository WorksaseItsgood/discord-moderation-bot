const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

// Announce command - Make formatted announcement
module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Make a formatted announcement')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Announcement title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Announcement message')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),
  permissions: [require('discord.js').PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    const embed = new EmbedBuilder()
      .setTitle('📢 ' + title)
      .setColor(0x3498db)
      .setDescription(message)
      .setTimestamp()
      .setFooter({ text: 'Announcement by ' + interaction.user.username });
    
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Announcement sent!', ephemeral: true });
  }
};