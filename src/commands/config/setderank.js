import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setderank')
    .setNameLocalizations({ fr: 'setderank', 'en-US': 'setderank' })
    .setDescription('Définir le seuil de derank')
    .setDescriptionLocalizations({ fr: 'Définir le seuil de derank', 'en-US': 'Set the derank threshold' })
    .addIntegerOption(option =>
      option.setName('threshold')
        .setNameLocalizations({ fr: 'threshold', 'en-US': 'threshold' })
        .setDescription('Pourcentage de rôles supprimés pour déclencher la protection (10-90)')
        .setDescriptionLocalizations({ fr: 'Pourcentage de rôles supprimés pour déclencher la protection (10-90)', 'en-US': 'Percentage of roles removed to trigger protection (10-90)' })
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(90))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setderank',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const threshold = interaction.options.getInteger('threshold');
      const guildId = interaction.guild.id;

      await updateGuildConfig(guildId, { derankThreshold: threshold });

      let config = client.guildConfigs.get(guildId) || {};
      config.derankThreshold = threshold;
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Seuil de derank défini')
        .setDescription(`Le seuil de derank est maintenant de **${threshold}%**.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la définition du seuil de derank:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la définition du seuil de derank.', ephemeral: true });
    }
  },
};
