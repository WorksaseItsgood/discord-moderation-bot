import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setNameLocalizations({ fr: 'setlogs', 'en-US': 'setlogs' })
    .setDescription('Définir le salon des logs de modération')
    .setDescriptionLocalizations({ fr: 'Définir le salon des logs de modération', 'en-US': 'Set the moderation log channel' })
    .addChannelOption(option =>
      option.setName('channel')
        .setNameLocalizations({ fr: 'channel', 'en-US': 'channel' })
        .setDescription('Le salon pour les logs')
        .setDescriptionLocalizations({ fr: 'Le salon pour les logs', 'en-US': 'The channel for logs' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setlogs',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel');
      const guildId = interaction.guild.id;

      await updateGuildConfig(guildId, { modLogChannel: channel.id });

      let config = client.guildConfigs.get(guildId) || {};
      config.modLogChannel = channel.id;
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Salon des logs défini')
        .setDescription(`Le salon des logs de modération a été défini sur ${channel}.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la définition du salon des logs:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la définition du salon des logs.', ephemeral: true });
    }
  },
};
