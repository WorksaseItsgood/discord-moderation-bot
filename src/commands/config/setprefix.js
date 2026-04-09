import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setNameLocalizations({ fr: 'setprefix', 'en-US': 'setprefix' })
    .setDescription('Définir le préfixe des commandes')
    .setDescriptionLocalizations({ fr: 'Définir le préfixe des commandes', 'en-US': 'Set the command prefix' })
    .addStringOption(option =>
      option.setName('prefix')
        .setNameLocalizations({ fr: 'prefix', 'en-US': 'prefix' })
        .setDescription('Le nouveau préfixe')
        .setDescriptionLocalizations({ fr: 'Le nouveau préfixe', 'en-US': 'The new prefix' })
        .setRequired(true)
        .setMaxLength(5))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setprefix',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const prefix = interaction.options.getString('prefix');
      const guildId = interaction.guild.id;

      await updateGuildConfig(guildId, { prefix });

      let config = client.guildConfigs.get(guildId) || {};
      config.prefix = prefix;
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Préfixe défini')
        .setDescription(`Le préfixe des commandes a été défini sur \`${prefix}\`.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la définition du préfixe:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la définition du préfixe.', ephemeral: true });
    }
  },
};
