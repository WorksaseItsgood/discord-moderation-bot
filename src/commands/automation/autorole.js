import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('autorole').setNameLocalizations({ fr: 'autorole', 'en-US': 'autorole' }).setDescription('Set auto role for new members').setDescriptionLocalizations({ fr: 'Définir le rôle auto pour les nouveaux membres', 'en-US': 'Set auto role for new members' }).addRoleOption(o => o.setName('role').setNameLocalizations({ fr: 'rôle' }).setDescription('Role to assign').setDescriptionLocalizations({ fr: 'Rôle à assigner' }).setRequired(true)),
  name: 'autorole', permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageRoles] },
  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    await updateGuildConfig(interaction.guild.id, { autoRole: role.id });
    client.guildConfigs.set(interaction.guild.id, { ...(client.guildConfigs.get(interaction.guild.id) || {}), autoRole: role.id });
    await interaction.reply({ content: `✅ Auto-role défini: ${role.name}`, ephemeral: true });
  },
};
