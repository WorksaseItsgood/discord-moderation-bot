const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Hug a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to hug')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} hugs ${target} (^ω^) (⊂((・▽・))⊃ 💕`);
  },
};