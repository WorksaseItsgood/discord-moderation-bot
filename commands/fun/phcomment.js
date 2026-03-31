const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Phcomment command - Fake Pornhub comment
module.exports = {
  data: new SlashCommandBuilder()
    .setName('phcomment')
    .setDescription('Create fake Pornhub comment')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mention')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('comment')
        .setDescription('Comment text')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const comment = interaction.options.getString('comment');
    
    const embed = new EmbedBuilder()
      .setTitle('Pornhub')
      .setColor(0xff9900)
      .setThumbnail('https://i.imgur.com/gKf8nmN.png')
      .setDescription(comment)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setFooter({ text: '👍 1.2K  💬 256  📅 2h ago' });
    
    await interaction.reply({ embeds: [embed] });
  }
};