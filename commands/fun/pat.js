const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pat')
    .setDescription('Pat a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to pat')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} pats ${target} (◕‿◕) 👋`);
  },
};