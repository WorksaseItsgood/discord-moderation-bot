/**
 * Playlist Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your playlists')
    .addStringOption(option => option.setName('action').setDescription('Action to perform')
      .addChoices(
        { name: 'Create', value: 'create' },
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' },
        { name: 'List', value: 'list' }
      ).setRequired(false))
    .addStringOption(option => option.setName('name').setDescription('Playlist name').setRequired(false))
    .addStringOption(option => option.setName('song').setDescription('Song to add/remove').setRequired(false)),
  
  async execute(interaction, client) {
    const action = interaction.options.getString('action') || 'list';
    const name = interaction.options.getString('name');
    const song = interaction.options.getString('song');
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Playlists')
      .setDescription('Your playlists:\n• Chill Vibes\n• Gaming Music\n• Workout\n\nUse `/playlist create <name>` to create new!')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};