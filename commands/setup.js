const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'setup',
  description: 'Configure le bot pour ce serveur',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Configuration du Bot')
      .setColor(0x5865F2)
      .setDescription('Configure le bot selon tes besoins')
      .addFields(
        { name: '📝 Logs', value: 'Channel pour les logs de modération', inline: true },
        { name: '🛡️ Anti-Raid', value: 'Protection contre les raids', inline: true },
        { name: '🎭 Roles', value: 'Configuration des rôles', inline: true }
      );

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('cfg_logs').setLabel('📝 Logs').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cfg_antiraid').setLabel('🛡️ Anti-Raid').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cfg_roles').setLabel('🎭 Roles').setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('cfg_welcome').setLabel('👋 Welcome').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cfg_ticket').setLabel('🎫 Tickets').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cfg_save').setLabel('💾 Sauvegarder').setStyle(ButtonStyle.Success)
      );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }
};