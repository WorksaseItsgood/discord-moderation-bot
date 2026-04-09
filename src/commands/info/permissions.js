import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setNameLocalizations({ fr: 'permissions', 'en-US': 'permissions' })
    .setDescription('Afficher les permissions d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Afficher les permissions d\'un utilisateur', 'en-US': 'Show user permissions' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'user', 'en-US': 'user' })
        .setDescription('L\'utilisateur')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur', 'en-US': 'The user' })
        .setRequired(false))
    .setDMPermission(false),
  name: 'permissions',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return await interaction.reply({ content: 'Utilisateur non trouvé sur ce serveur.', ephemeral: true });
      }

      const permissions = member.permissions;

      const permMappings = {
        'CreateInstantInvite': 'Créer des invitations',
        'KickMembers': 'Expulser des membres',
        'BanMembers': 'Bannir des membres',
        'Administrator': 'Administrateur',
        'ManageChannels': 'Gérer les salons',
        'ManageGuild': 'Gérer le serveur',
        'AddReactions': 'Ajouter des réactions',
        'ViewAuditLog': 'Voir le journal d\'audit',
        'PrioritySpeaker': 'Priority Speaker',
        'Stream': 'Stream',
        'ViewChannel': 'Voir les salons',
        'SendMessages': 'Envoyer des messages',
        'SendTTSMessages': 'Envoyer des messages TTS',
        'ManageMessages': 'Gérer les messages',
        'EmbedLinks': 'Intégrer des liens',
        'AttachFiles': 'Joindre des fichiers',
        'ReadMessageHistory': 'Lire l\'historique des messages',
        'MentionEveryone': 'Mentionner @everyone',
        'UseExternalEmojis': 'Utiliser des emojis externes',
        'ViewGuildInsights': 'Voir les insights du serveur',
        'Connect': 'Se connecter',
        'Speak': 'Parler',
        'MuteMembers': 'Rendre muet les membres',
        'DeafenMembers': 'Assourdir les membres',
        'MoveMembers': 'Déplacer des membres',
        'UseVAD': 'Utiliser la détection de voix',
        'ChangeNickname': 'Changer de pseudo',
        'ManageNicknames': 'Gérer les pseudos',
        'ManageRoles': 'Gérer les rôles',
        'ManageWebhooks': 'Gérer les webhooks',
        'ManageEmojisAndStickers': 'Gérer les emojis et stickers',
        'UseApplicationCommands': 'Utiliser les commandes d\'application',
        'RequestToSpeak': 'Demander à parler',
        'ManageEvents': 'Gérer les événements',
        'ManageThreads': 'Gérer les fils',
        'CreatePublicThreads': 'Créer des fils publics',
        'CreatePrivateThreads': 'Créer des fils privés',
        'UseExternalStickers': 'Utiliser des stickers externes',
        'SendMessagesInThreads': 'Envoyer des messages dans les fils',
        'UseEmbeddedActivities': 'Utiliser les activités',
        'TimeoutMembers': 'Timeout des membres'
      };

      const granted = [];
      const denied = [];

      for (const [perm, label] of Object.entries(permMappings)) {
        if (permissions.has(perm)) {
          granted.push(label);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`Permissions de ${user.username}`)
        .setDescription(`**Total:** ${granted.length} permissions accordées`)
        .addFields(
          { name: '▸ Permissions accordées', value: granted.length > 0 ? granted.join(', ') : 'Aucune', inline: false }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setColor(0x3498db)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'affichage des permissions:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage des permissions.', ephemeral: true });
    }
  },
};
