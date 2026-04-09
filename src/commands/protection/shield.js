import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('shield').setNameLocalizations({ fr: 'shield', 'en-US': 'shield' }).setDescription('Show protection shield status').setDescriptionLocalizations({ fr: 'Afficher le statut de protection', 'en-US': 'Show protection shield status' }),
  name: 'shield', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const guildId = interaction.guild.id;
    const config = client.guildConfigs.get(guildId) || {};
    const raidState = client.raidMode?.get(guildId);
    const userId = interaction.user.id;
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
    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      const newState = !(config.shieldEnabled !== false);
      client.guildConfigs.set(guildId, { ...config, shieldEnabled: newState });
      const { updateGuildConfig } = await import('../../database/db.js');
      await updateGuildConfig(guildId, { shieldEnabled: newState });
      await btn.editReply({ content: newState ? '🟢 Shield activé!' : '🔴 Shield désactivé!', embeds: [], components: [] });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
