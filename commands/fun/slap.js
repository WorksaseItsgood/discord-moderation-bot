const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Slap a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to slap')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    await interaction.reply(`${user} slaps ${target} (⊙_⊙) ✋👊`);
  },
};