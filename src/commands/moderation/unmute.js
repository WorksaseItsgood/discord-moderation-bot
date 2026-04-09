/**
 * /unmute - Retirer le mute d'un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setNameLocalizations({ fr: 'unmute', 'en-US': 'unmute' })
    .setDescription('Retirer le mute d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Retirer le mute d\'un utilisateur', 'en-US': 'Remove mute from a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à démuter')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à démuter', 'en-US': 'The user to unmute' })
        .setRequired(true)),
  name: 'unmute',
  permissions: { user: [PermissionFlagsBits.MuteMembers], bot: [PermissionFlagsBits.MuteMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à démuter.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔊 Confirmation de unmute')
      .setColor(0x00cc00)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`unmute_confirm_${target.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('unmute_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`unmute_confirm_${target.id}`, async (btnInteraction) => {
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

        if (!member.isCommunicationDisabled()) {
          return btnInteraction.update({
            embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Cet utilisateur n\'est pas muté.')],
            components: [],
          });
        }

        await member.timeout(null, `Unmuté par ${interaction.user.tag}`);

        const { removeMute } = await import('../../../database/db.js');
        await removeMute(interaction.guild.id, target.id);

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🔊 Utilisateur démuté')
            .setDescription(`Le mute de **${target.tag}** a été retiré.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'unmute',
          userId: target.id,
          moderatorId: interaction.user.id,
          timestamp: Date.now(),
        });

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du unmute').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`unmute_confirm_${target.id}`);
      client.buttonHandlers.delete('unmute_cancel');
    });

    client.buttonHandlers.set('unmute_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Unmute annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`unmute_confirm_${target.id}`);
      client.buttonHandlers.delete('unmute_cancel');
    });
  },
};
