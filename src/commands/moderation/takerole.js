/**
 * /takerole - Retirer un rôle à un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('takerole')
    .setNameLocalizations({ fr: 'takerole', 'en-US': 'takerole' })
    .setDescription('Retirer un rôle à un utilisateur')
    .setDescriptionLocalizations({ fr: 'Retirer un rôle à un utilisateur', 'en-US': 'Remove a role from a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur', 'en-US': 'The user' })
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setNameLocalizations({ fr: 'rôle', 'en-US': 'role' })
        .setDescription('Le rôle à retirer')
        .setDescriptionLocalizations({ fr: 'Le rôle à retirer', 'en-US': 'The role to remove' })
        .setRequired(true)),
  name: 'takerole',
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
      .setTitle('🎭 Confirmation de retrait de rôle')
      .setColor(0xff6600)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Rôle', value: `${role.name} (${role.id})`, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`takerole_confirm_${target.id}_${role.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('takerole_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      if (btn.customId === `takerole_confirm_${target.id}_${role.id}`) {
        try {
          const member = await interaction.guild.members.fetch(target.id).catch(() => null);
          if (!member) {
            return btn.editReply({
              embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Membre introuvable.')],
              components: [],
            });
          }

          if (!member.roles.cache.has(role.id)) {
            return btn.editReply({
              embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`❌ **${target.tag}** n'a pas le rôle ${role.name}.`)],
              components: [],
            });
          }

          await member.roles.remove(role, `Rôle retiré par ${interaction.user.tag}`);

          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle('🎭 Rôle retiré')
              .setDescription(`Le rôle ${role.name} a été retiré à **${target.tag}**.`)
              .setTimestamp()],
            components: [],
          });

          const { addLog } = await import('../../../database/db.js');
          await addLog(interaction.guild.id, {
            action: 'takerole',
            userId: target.id,
            moderatorId: interaction.user.id,
            roleId: role.id,
            roleName: role.name,
            timestamp: Date.now(),
          });

        } catch (err) {
          await btn.editReply({
            embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
            components: [],
          });
        }
      } else if (btn.customId === 'takerole_cancel') {
        await btn.editReply({
          embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Opération annulée.')],
          components: [],
        });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
