const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Starboard command - configure starboard
module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Configure starboard')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Setup', value: 'setup' },
          { name: 'Disable', value: 'disable' }
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Starboard channel')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('threshold')
        .setDescription('Stars required to add to starboard')
        .setMinValue(1)
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel');
    const threshold = interaction.options.getInteger('threshold') || 3;
    const guild = interaction.guild;
    
    // Store in config (simplified)
    const db = require('../database');
    const settings = db.getWelcomeSettings(guild.id) || {};
    
    switch (action) {
      case 'setup':
        if (!channel) {
          return interaction.reply({ content: '❌ Please provide a channel!', ephemeral: true });
        }
        
        // Store as starboard channel (using a workaround)
        db.setWelcomeSettings(guild.id, {
          ...settings,
          starboardChannel: channel.id,
          starboardThreshold: threshold
        });
        
        await interaction.reply(`✅ Starboard set to ${channel} with threshold ${threshold} stars!`);
        break;
        
      case 'disable':
        db.setWelcomeSettings(guild.id, {
          ...settings,
          starboardChannel: null
        });
        
        await interaction.reply('✅ Starboard disabled!');
        break;
    }
  }
};