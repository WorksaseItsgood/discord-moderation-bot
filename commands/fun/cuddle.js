const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cuddle')
    .setDescription('Cuddle a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to cuddle')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} cuddles ${target} (っ◕‿◕)っ 💕`);
  },
};