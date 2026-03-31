const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Kiss a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kiss')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} kisses ${target} (◕‿◕)♡ 💋`);
  },
};