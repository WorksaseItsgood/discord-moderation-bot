import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getWhitelist } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setNameLocalizations({ fr: 'userinfo', 'en-US': 'userinfo' })
    .setDescription('Afficher les informations d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Afficher les informations d\'un utilisateur', 'en-US': 'Show user information' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'user', 'en-US': 'user' })
        .setDescription('L\'utilisateur')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur', 'en-US': 'The user' })
        .setRequired(false))
    .setDMPermission(false),
  name: 'userinfo',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return await interaction.reply({ content: 'Utilisateur non trouvé sur ce serveur.', ephemeral: true });
      }

      const roles = member.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position);

      const joinedAt = member.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : 'Inconnu';
      const createdAt = Math.floor(user.createdAt.getTime() / 1000);
      const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      const guildId = interaction.guild.id;
      const whitelist = await getWhitelist(guildId);
      const isWhitelisted = whitelist.some(w => w.type === 'user' && w.id === user.id);

      const statusEmoji = {
        'online': '🟢',
        'idle': '🟡',
        'dnd': '🔴',
        'offline': '⚫'
      };

      const status = statusEmoji[member.presence?.status] || '⚫';

      const embed = new EmbedBuilder()
        .setTitle(`${status} ${user.username}`)
        .setDescription(isWhitelisted ? '✅ **Liste blanche**' : '')
        .addFields(
          { name: '▸ ID', value: user.id, inline: true },
          { name: '▸ Tag', value: user.tag, inline: true },
          { name: '▸ Account créé', value: `<t:${createdAt}:R> (${accountAge} jours)`, inline: false },
          { name: '▸ A rejoint le serveur', value: member.joinedAt ? `<t:${joinedAt}:R>` : 'Inconnu', inline: false },
          { name: '▸ Rôles', value: roles.length > 0 ? roles.map(r => r).join(', ') : 'Aucun', inline: false }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setColor(member.displayColor || 0x3498db)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'affichage des informations utilisateur:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage des informations utilisateur.', ephemeral: true });
    }
  },
};
