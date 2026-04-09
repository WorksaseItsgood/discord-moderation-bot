import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setNameLocalizations({ fr: 'roleinfo', 'en-US': 'roleinfo' })
    .setDescription('Afficher les informations d\'un rôle')
    .setDescriptionLocalizations({ fr: 'Afficher les informations d\'un rôle', 'en-US': 'Show role information' })
    .addRoleOption(option =>
      option.setName('role')
        .setNameLocalizations({ fr: 'role', 'en-US': 'role' })
        .setDescription('Le rôle')
        .setDescriptionLocalizations({ fr: 'Le rôle', 'en-US': 'The role' })
        .setRequired(true))
    .setDMPermission(false),
  name: 'roleinfo',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const role = interaction.options.getRole('role');

      const membersWithRole = role.members.size;
      const createdAt = Math.floor(role.createdAt.getTime() / 1000);
      const colorHex = role.color ? role.color.toString(16).toUpperCase().padStart(6, '0') : '000000';

      const permissionsList = [];
      if (role.permissions.has('Administrator')) {
        permissionsList.push('Administrateur');
      } else {
        const permMappings = {
          'KickMembers': 'Expulser des membres',
          'BanMembers': 'Bannir des membres',
          'ManageChannels': 'Gérer les salons',
          'ManageGuild': 'Gérer le serveur',
          'ManageMessages': 'Gérer les messages',
          'MentionEveryone': 'Mentionner @everyone',
          'MuteMembers': 'Rendre muet',
          'DeafenMembers': 'Assourdir',
          'MoveMembers': 'Déplacer des membres',
          'ManageRoles': 'Gérer les rôles'
        };
        for (const [perm, label] of Object.entries(permMappings)) {
          if (role.permissions.has(perm)) {
            permissionsList.push(label);
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`${role.name}`)
        .setDescription(`**▸ ID:** ${role.id}\n**▸ Couleur:** #${colorHex}\n**▸ Créé le:** <t:${createdAt}:R>\n**▸ Membres:** ${membersWithRole}`)
        .addFields(
          { name: '▸ Hiérarchie', value: `Position: ${role.position}`, inline: true },
          { name: '▸ Affiché séparément', value: role.hoist ? 'Oui' : 'Non', inline: true },
          { name: '▸ Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true }
        )
        .setColor(role.color || 0x000000)
        .setTimestamp();

      if (permissionsList.length > 0) {
        embed.addFields({ name: '▸ Permissions', value: permissionsList.join(', '), inline: false });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'affichage des informations du rôle:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage des informations du rôle.', ephemeral: true });
    }
  },
};
