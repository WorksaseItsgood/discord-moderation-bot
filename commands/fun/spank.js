const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spank')
    .setDescription('Spank a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to spank')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} spanks ${target} ( spank ) ( spank ) ✋`);
  },
};