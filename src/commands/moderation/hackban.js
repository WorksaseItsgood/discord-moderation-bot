/**
 * /hackban - Ban un utilisateur par ID sans qu'il soit sur le serveur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hackban')
    .setNameLocalizations({ fr: 'hackban', 'en-US': 'hackban' })
    .setDescription('Ban un utilisateur par ID sans qu\'il soit sur le serveur')
    .setDescriptionLocalizations({ fr: 'Ban un utilisateur par ID sans qu\'il soit sur le serveur', 'en-US': 'Ban a user by ID without them being on the server' })
    .addStringOption(option =>
      option.setName('user_id')
        .setNameLocalizations({ fr: 'id_utilisateur', 'en-US': 'user_id' })
        .setDescription('L\'ID de l\'utilisateur à bannir')
        .setDescriptionLocalizations({ fr: 'L\'ID de l\'utilisateur à bannir', 'en-US': 'The ID of the user to ban' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison du ban')
        .setDescriptionLocalizations({ fr: 'Raison du ban', 'en-US': 'Reason for ban' })
        .setRequired(false)),
  name: 'hackban',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!userId) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un ID d\'utilisateur.')],
        ephemeral: true,
      });
    }

    if (!/^\d{17,19}$/.test(userId)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ ID d\'utilisateur invalide.')],
        ephemeral: true,
      });
    }

    try {
      const user = await client.users.fetch(userId).catch(() => null);
      const tag = user ? user.tag : `Utilisateur inconnu (${userId})`;

      const bans = await interaction.guild.bans.fetch();
      if (bans.has(userId)) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`❌ ${tag} est déjà banni.`).setTimestamp()],
          ephemeral: true,
        });
      }

      await interaction.guild.bans.create(userId, {
        reason: `${reason} | Hackban par ${interaction.user.tag}`,
        deleteMessageDays: 0,
      });

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('🔨 Hackban effectué')
          .setDescription(`**${tag}** (${userId}) a été banni.\nRaison: ${reason}`)
          .setTimestamp()],
        ephemeral: true,
      });

      const { addLog } = await import('../../../database/db.js');
      await addLog(interaction.guild.id, {
        action: 'hackban',
        userId,
        moderatorId: interaction.user.id,
        reason,
        timestamp: Date.now(),
      });

    } catch (err) {
      if (err.code === 10013) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Utilisateur introuvable.')->setTimestamp()],
          ephemeral: true,
        });
      }
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Erreur').setDescription(err.message).setTimestamp()],
        ephemeral: true,
      });
    }
  },
};
