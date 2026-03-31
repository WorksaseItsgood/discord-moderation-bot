const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Say command - Make bot say something
module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)),
  permissions: [require('discord.js').PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    
    await interaction.reply({ content: message });
  }
};