/**
 * Online Count Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinecount')
    .setDescription('View online member count'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    const online = guild.members.cache.filter(m => m.presence.status === 'online').size;
    
    await interaction.reply({ content: `🟢 Online: ${online} members` });
  }
};