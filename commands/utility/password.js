/**
 * Generate Password Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('password')
    .setDescription('Generate a random password')
    .addIntegerOption(option => option.setName('length').setDescription('Length').setMinValue(8).setMaxValue(32).setRequired(false)),
  
  async execute(interaction, client) {
    const length = interaction.options.getInteger('length') || 16;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    await interaction.reply({ content: `🔑 Generated password: \`${password}\`` });
  }
};