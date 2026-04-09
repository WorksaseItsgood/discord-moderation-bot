import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setmutedrole')
    .setNameLocalizations({ fr: 'setmutedrole', 'en-US': 'setmutedrole' })
    .setDescription('Définir le rôle muet')
    .setDescriptionLocalizations({ fr: 'Définir le rôle muet', 'en-US': 'Set the muted role' })
    .addRoleOption(option =>
      option.setName('role')
        .setNameLocalizations({ fr: 'role', 'en-US': 'role' })
        .setDescription('Le rôle pour les membres muets')
        .setDescriptionLocalizations({ fr: 'Le rôle pour les membres muets', 'en-US': 'The role for muted members' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'setmutedrole',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const role = interaction.options.getRole('role');
      const guildId = interaction.guild.id;

      await updateGuildConfig(guildId, { mutedRole: role.id });

      let config = client.guildConfigs.get(guildId) || {};
      config.mutedRole = role.id;
      client.guildConfigs.set(guildId, config);

      const embed = new EmbedBuilder()
        .setTitle('✓ Rôle muet défini')
        .setDescription(`Le rôle muet a été défini sur ${role}.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la définition du rôle muet:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la définition du rôle muet.', ephemeral: true });
    }
  },
};
