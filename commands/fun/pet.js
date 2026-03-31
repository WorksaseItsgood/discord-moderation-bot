const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pet')
    .setDescription('Pet a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to pet')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} pets ${target} (人◕‿◕) 🐾`);
  },
};