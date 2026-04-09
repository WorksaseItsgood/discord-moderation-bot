import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setNameLocalizations({ fr: 'serverinfo', 'en-US': 'serverinfo' })
    .setDescription('Afficher les informations du serveur')
    .setDescriptionLocalizations({ fr: 'Afficher les informations du serveur', 'en-US': 'Show server information' })
    .setDMPermission(false),
  name: 'serverinfo',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;

      const totalMembers = guild.memberCount;
      const humans = guild.members.cache.filter(m => !m.user.bot).size;
      const bots = guild.members.cache.filter(m => m.user.bot).size;

      const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
      const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
      const categories = guild.channels.cache.filter(c => c.type === 4).size;
      const totalChannels = textChannels + voiceChannels + categories;

      const rolesCount = guild.roles.cache.size - 1;

      const verificationLevels = {
        0: 'Aucun',
        1: 'Faible',
        2: 'Moyen',
        3: 'Élevé',
        4: 'Très élevé'
      };

      const boostLevel = guild.premiumTier ? `Niveau ${guild.premiumTier}` : 'Aucun';
      const boostCount = guild.premiumSubscriptionCount || 0;

      const createdAt = Math.floor(guild.createdAt.getTime() / 1000);

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }))
        .addFields(
          { name: '▸ Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
          { name: '▸ Créé le', value: `<t:${createdAt}:D>`, inline: true },
          { name: '▸ Niveau de vérification', value: verificationLevels[guild.verificationLevel] || 'Inconnu', inline: true },
          { name: '▸ Membres', value: `Total: ${totalMembers}\nHumains: ${humans}\nBots: ${bots}`, inline: true },
          { name: '▸ Salons', value: `Total: ${totalChannels}\nTextuels: ${textChannels}\nVocaux: ${voiceChannels}\nCatégories: ${categories}`, inline: true },
          { name: '▸ Rôles', value: `${rolesCount}`, inline: true },
          { name: '▸ Nitro Boost', value: `${boostLevel} (${boostCount} boosts)`, inline: true }
        )
        .setColor(0x3498db)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'affichage des informations du serveur:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage des informations du serveur.', ephemeral: true });
    }
  },
};
