/**
 * Roast Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Roast a user')
    .addUserOption(option => option.setName('user').setDescription('User to roast').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const roasts = [
      `${user.username} is about as useful as a screen door on a submarine.`,
      `${user.username} has the perfect face for radio.`,
      `${user.username} could stare at a can of paint and get a headache.`,
      `I'd agree with you but then we'd both be wrong.`
    ];
    
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    
    await interaction.reply({ content: `🔥 ${roast}` });
  }
};