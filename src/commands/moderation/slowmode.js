/**
 * /slowmode - Définir le mode lent d'un salon
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setNameLocalizations({ fr: 'slowmode', 'en-US': 'slowmode' })
    .setDescription('Définir le mode lent d\'un salon')
    .setDescriptionLocalizations({ fr: 'Définir le mode lent d\'un salon', 'en-US': 'Set slowmode for a channel' })
    .addStringOption(option =>
      option.setName('duration')
        .setNameLocalizations({ fr: 'durée', 'en-US': 'duration' })
        .setDescription('Durée du slowmode')
        .setDescriptionLocalizations({ fr: 'Durée du slowmode', 'en-US': 'Slowmode duration' })
        .addChoices(
          { name: 'Désactivé', value: 'off', name_localizations: { fr: 'Désactivé', 'en-US': 'Off' } },
          { name: '5 secondes', value: '5s', name_localizations: { fr: '5 secondes', 'en-US': '5 seconds' } },
          { name: '10 secondes', value: '10s', name_localizations: { fr: '10 secondes', 'en-US': '10 seconds' } },
          { name: '30 secondes', value: '30s', name_localizations: { fr: '30 secondes', 'en-US': '30 seconds' } },
          { name: '1 minute', value: '1m', name_localizations: { fr: '1 minute', 'en-US': '1 minute' } },
          { name: '5 minutes', value: '5m', name_localizations: { fr: '5 minutes', 'en-US': '5 minutes' } },
          { name: '15 minutes', value: '15m', name_localizations: { fr: '15 minutes', 'en-US': '15 minutes' } }
        )
        .setRequired(true)),
  name: 'slowmode',
  permissions: { user: [PermissionFlagsBits.ManageChannels], bot: [PermissionFlagsBits.ManageChannels] },

  async execute(interaction, client) {
    const durationStr = interaction.options.getString('duration');

    const slowmodeDurations = {
      'off': 0,
      '5s': 5,
      '10s': 10,
      '30s': 30,
      '1m': 60,
      '5m': 300,
      '15m': 900,
    };

    const delay = slowmodeDurations[durationStr];
    if (delay === undefined) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Durée invalide.')],
        ephemeral: true,
      });
    }

    try {
      const channel = interaction.channel;
      await channel.setRateLimitPerUser(delay, `Slowmode par ${interaction.user.tag}`);

      const durationLabel = durationStr === 'off' ? 'désactivé' : durationStr;
      const emoji = delay === 0 ? '✅' : '🐌';

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x00cc00)
          .setTitle(`${emoji} Slowmode activé`)
          .setDescription(`Le mode lent du salon ${channel} est maintenant ${delay === 0 ? 'désactivé' : `de ${durationLabel}`}.`)
          .setTimestamp()],
        ephemeral: true,
      });

      const { addLog } = await import('../../../database/db.js');
      await addLog(interaction.guild.id, {
        action: 'slowmode',
        channelId: channel.id,
        moderatorId: interaction.user.id,
        duration: durationStr,
        delay,
        timestamp: Date.now(),
      });

    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Erreur').setDescription(err.message).setTimestamp()],
        ephemeral: true,
      });
    }
  },
};
