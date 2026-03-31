/**
 * AFK Command - Set AFK status
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set AFK status')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for being AFK')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'AFK';
    
    // Store AFK status
    if (!client.afkStatus) client.afkStatus = new Map();
    client.afkStatus.set(interaction.user.id, { reason, since: Date.now() });
    
    const embed = new EmbedBuilder()
      .setTitle('💤 AFK Set')
      .setDescription(`You're now AFK: ${reason}`)
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};