import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setraidconfig')
    .setNameLocalizations({ fr: 'setraidconfig', 'en-US': 'setraidconfig' })
    .setDescription('Définir le seuil de détection de raid')
    .setDescriptionLocalizations({ fr: 'Définir le seuil de détection de raid', 'en-US': 'Set the raid detection threshold' })
    .addIntegerOption(option =>
      option.setName('threshold')
        .setNameLocalizations({ fr: 'threshold', 'en-US': 'threshold' })
        .setDescription('Nombre de membres en X secondes pour déclencher le raid (5-50)')
        .setDescriptionLocalizations({ fr: 'Nombre de membres en X secondes pour déclencher le raid (5-50)', 'en-US': 'Number of members in X seconds to trigger raid (5-50)' })
        .setRequired(true)
        .setMinValue(5)
        .setMaxValue(50))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setraidconfig',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const threshold = interaction.options.getInteger('threshold');
      const guildId = interaction.guild.id;

      await updateGuildConfig(guildId, { raidThreshold: threshold });

      let config = client.guildConfigs.get(guildId) || {};
      config.raidThreshold = threshold;
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Configuration du raid définie')
        .setDescription(`Le seuil de détection de raid est maintenant de **${threshold}** membres.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la définition de la configuration du raid:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la définition de la configuration du raid.', ephemeral: true });
    }
  },
};
