import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setantispam')
    .setNameLocalizations({ fr: 'setantispam', 'en-US': 'setantispam' })
    .setDescription('Activer ou désactiver l\'anti-spam')
    .setDescriptionLocalizations({ fr: 'Activer ou désactiver l\'anti-spam', 'en-US': 'Enable or disable anti-spam' })
    .addStringOption(option =>
      option.setName('enable')
        .setNameLocalizations({ fr: 'enable', 'en-US': 'enable' })
        .setDescription('Activer ou désactiver')
        .setDescriptionLocalizations({ fr: 'Activer ou désactiver', 'en-US': 'Enable or disable' })
        .setRequired(true)
        .addChoices(
          { name: 'Activer', value: 'enable' },
          { name: 'Désactiver', value: 'disable' }
        ))
    .addIntegerOption(option =>
      option.setName('threshold')
        .setNameLocalizations({ fr: 'threshold', 'en-US': 'threshold' })
        .setDescription('Seuil de spam (messages en 5 secondes, 3-10)')
        .setDescriptionLocalizations({ fr: 'Seuil de spam (messages en 5 secondes, 3-10)', 'en-US': 'Spam threshold (messages in 5 seconds, 3-10)' })
        .setRequired(false)
        .setMinValue(3)
        .setMaxValue(10))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setantispam',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const enable = interaction.options.getString('enable') === 'enable';
      const threshold = interaction.options.getInteger('threshold') || 5;
      const guildId = interaction.guild.id;

      const updates = { antiSpamEnabled: enable };
      if (enable) {
        updates.antiSpamThreshold = threshold;
      }

      await updateGuildConfig(guildId, updates);

      let config = client.guildConfigs.get(guildId) || {};
      config.antiSpamEnabled = enable;
      if (enable) {
        config.antiSpamThreshold = threshold;
      }
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Configuration anti-spam')
        .setDescription(`L'anti-spam a été **${enable ? 'activé' : 'désactivé'}**${enable ? ` avec un seuil de **${threshold}** messages.` : '.'}.`)
        .setColor(enable ? 0x00ff00 : 0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'anti-spam:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la configuration de l\'anti-spam.', ephemeral: true });
    }
  },
};
