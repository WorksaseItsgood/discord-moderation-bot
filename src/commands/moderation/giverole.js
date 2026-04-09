/**
 * /giverole - Donner un rôle à un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giverole')
    .setNameLocalizations({ fr: 'giverole', 'en-US': 'giverole' })
    .setDescription('Donner un rôle à un utilisateur')
    .setDescriptionLocalizations({ fr: 'Donner un rôle à un utilisateur', 'en-US': 'Give a role to a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur', 'en-US': 'The user' })
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setNameLocalizations({ fr: 'rôle', 'en-US': 'role' })
        .setDescription('Le rôle à donner')
        .setDescriptionLocalizations({ fr: 'Le rôle à donner', 'en-US': 'The role to give' })
        .setRequired(true)),
  name: 'giverole',
  permissions: { user: [PermissionFlagsBits.ManageRoles], bot: [PermissionFlagsBits.ManageRoles] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur.')],
        ephemeral: true,
      });
    }

    if (!role) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un rôle.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🎭 Confirmation d\'attribution de rôle')
      .setColor(0x9900ff)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Rôle', value: `${role.name} (${role.id})`, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`giverole_confirm_${target.id}_${role.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('giverole_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`giverole_confirm_${target.id}_${role.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
          return btnInteraction.update({
            embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Membre introuvable.')],
            components: [],
          });
        }

        if (member.roles.cache.has(role.id)) {
          return btnInteraction.update({
            embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`❌ **${target.tag}** a déjà le rôle ${role.name}.`)],
            components: [],
          });
        }

        await member.roles.add(role, `Rôle donné par ${interaction.user.tag}`);

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🎭 Rôle attribué')
            .setDescription(`Le rôle ${role.name} a été donné à **${target.tag}**.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'giverole',
          userId: target.id,
          moderatorId: interaction.user.id,
          roleId: role.id,
          roleName: role.name,
          timestamp: Date.now(),
        });

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`giverole_confirm_${target.id}_${role.id}`);
      client.buttonHandlers.delete('giverole_cancel');
    });

    client.buttonHandlers.set('giverole_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Opération annulée.')],
        components: [],
      });
      client.buttonHandlers.delete(`giverole_confirm_${target.id}_${role.id}`);
      client.buttonHandlers.delete('giverole_cancel');
    });
  },
};
