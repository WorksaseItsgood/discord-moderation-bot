const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Tweet command - Fake Twitter tweet
module.exports = {
  data: new SlashCommandBuilder()
    .setName('tweet')
    .setDescription('Create fake Twitter tweet')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mention')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Tweet text')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const text = interaction.options.getString('text');
    
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setColor(0x1da1f2)
      .setDescription(text)
      .setAuthor({ name: '@' + user.username, iconURL: user.displayAvatarURL() })
      .setFooter({ text: 'Twitter for iPhone' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};