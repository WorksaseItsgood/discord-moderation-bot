/**
 * Loop Command - Toggle loop mode
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle loop mode')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Loop mode')
        .setRequired(false)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' }
        )
    ),
  
  async execute(interaction, client) {
    if (!client.distube) {
      return interaction.reply({ content: 'Music system not loaded!', ephemeral: true });
    }
    
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    const mode = interaction.options.getString('mode') || 'off';
    let repeatMode = 0;
    
    if (mode === 'song') repeatMode = 1;
    else if (mode === 'queue') repeatMode = 2;
    
    queue.setRepeatMode(repeatMode);
    
    const modeNames = ['Off', 'Song', 'Queue'];
    await interaction.reply(`🔁 Loop mode: ${modeNames[repeatMode]}`);
  }
};