import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('shield').setNameLocalizations({ fr: 'shield', 'en-US': 'shield' }).setDescription('Show protection shield status').setDescriptionLocalizations({ fr: 'Afficher le statut de protection', 'en-US': 'Show protection shield status' }),
  name: 'shield', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const guildId = interaction.guild.id;
    const config = client.guildConfigs.get(guildId) || {};
    const raidState = client.raidMode?.get(guildId);
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Shield Status')
      .setColor(0x5865F2)
      .addFields(
        { name: 'UltraShield', value: config.shieldEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
        { name: 'Anti-Spam', value: config.antiSpamEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
        { name: 'Anti-Raid', value: raidState?.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true },
        { name: 'AutoMod', value: config.autoModEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true }
      )
      .setTimestamp();
    const toggleBtn = new ButtonBuilder().setCustomId('shield_toggle').setLabel(config.shieldEnabled !== false ? '🔴 Désactiver' : '🟢 Activer').setStyle(config.shieldEnabled !== false ? ButtonStyle.Danger : ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(toggleBtn);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    client.buttonHandlers.set('shield_toggle', async (btn) => {
      if (btn.user.id !== interaction.user.id) return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      const newState = !(config.shieldEnabled !== false);
      client.guildConfigs.set(guildId, { ...config, shieldEnabled: newState });
      const { updateGuildConfig } = await import('../../database/db.js');
      await updateGuildConfig(guildId, { shieldEnabled: newState });
      await btn.update({ content: newState ? '🟢 Shield activé!' : '🔴 Shield désactivé!', embeds: [], components: [] });
    });
  },
};
