const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'shield',
  description: '🛡️ Panneau de configuration UltraShield v2',

  async execute(interaction) {
    const client = interaction.client;
    const raidConfig = client.raidConfig?.get(interaction.guildId) || { enabled: false };

    const embed = new EmbedBuilder()
      .setTitle('🛡️ UltraShield v2 - Panneau de Protection')
      .setColor(0x5865F2)
      .setDescription('Configurez les protections anti-raid du serveur.')
      .addFields(
        { name: 'Statut Global', value: raidConfig.enabled ? '🟢 Activé' : '🔴 Désactivé', inline: true },
        { name: 'Anti-Bot-Add', value: '🟢 Actif', inline: true },
        { name: 'Anti-Channel-Delete', value: '🟢 Actif', inline: true },
        { name: 'Anti-Role-Delete', value: '🟢 Actif', inline: true },
        { name: 'Anti-Webhook', value: '🟢 Actif', inline: true },
        { name: 'Anti-Ban-Wave', value: '🟢 Actif', inline: true },
        { name: 'Anti-Kick-Wave', value: '🟢 Actif', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - UltraShield v2' });

    const mainRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('shield_toggle').setLabel(raidConfig.enabled ? '🔴 Désactiver RaidMode' : '🟢 Activer RaidMode').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('shield_whitelist').setLabel('👥 Whitelist').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('shield_logs').setLabel('📜 Config Logs').setStyle(ButtonStyle.Secondary)
      );

    const infoRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('shield_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('shield_status').setLabel('📊 Status').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [mainRow, infoRow] });
  }
};
