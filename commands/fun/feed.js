const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feed')
    .setDescription('Feed a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to feed')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} feeds ${target} (˘▽˘)っ 🍕`);
  },
};