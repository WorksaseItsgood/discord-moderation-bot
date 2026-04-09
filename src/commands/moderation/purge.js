/**
 * /purge - Supprimer en masse des messages
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setNameLocalizations({ fr: 'purge', 'en-US': 'purge' })
    .setDescription('Supprimer en masse des messages')
    .setDescriptionLocalizations({ fr: 'Supprimer en masse des messages', 'en-US': 'Bulk delete messages' })
    .addIntegerOption(option =>
      option.setName('amount')
        .setNameLocalizations({ fr: 'nombre', 'en-US': 'amount' })
        .setDescription('Nombre de messages à supprimer')
        .setDescriptionLocalizations({ fr: 'Nombre de messages à supprimer', 'en-US': 'Number of messages to delete' })
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('Filtrer par utilisateur (optionnel)')
        .setDescriptionLocalizations({ fr: 'Filtrer par utilisateur (optionnel)', 'en-US': 'Filter by user (optional)' })
        .setRequired(false)),
  name: 'purge',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    if (!amount || amount < 1 || amount > 1000) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un nombre entre 1 et 1000.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Confirmation de purge')
      .setColor(0xff0000)
      .addFields(
        { name: 'Nombre', value: `${amount} message(s)`, inline: true },
        { name: 'Utilisateur', value: targetUser ? `${targetUser.tag}` : 'Tous', inline: true }
      )
      .setDescription('⚠️ Cette action supprimera définitivement les messages.')
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`purge_confirm_${amount}_${targetUser?.id || 'all'}`)
      .setLabel('✅ Confirmer la purge')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('purge_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`purge_confirm_${amount}_${targetUser?.id || 'all'}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const channel = interaction.channel;
        let deleted = 0;
        let remaining = amount;

        while (remaining > 0) {
          const batchSize = Math.min(remaining, 100);
          const messages = await channel.messages.fetch({ limit: batchSize });

          if (messages.size === 0) break;

          let toDelete = targetUser
            ? messages.filter(m => m.author.id === targetUser.id)
            : messages;

          toDelete = toDelete.first(batchSize);

          for (const msg of toDelete) {
            try {
              await msg.delete();
              deleted++;
              remaining--;
            } catch {}
          }

          if (messages.size < batchSize) break;
        }

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🗑️ Purge terminée')
            .setDescription(`${deleted} message(s) supprimé(s)${targetUser ? ` de **${targetUser.tag}**` : ''}.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'purge',
          userId: targetUser?.id || null,
          moderatorId: interaction.user.id,
          channelId: channel.id,
          amount: deleted,
          timestamp: Date.now(),
        });

        setTimeout(() => {
          btnInteraction.deleteReply().catch(() => {});
        }, 2000);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`purge_confirm_${amount}_${targetUser?.id || 'all'}`);
      client.buttonHandlers.delete('purge_cancel');
    });

    client.buttonHandlers.set('purge_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Purge annulée.')],
        components: [],
      });
      client.buttonHandlers.delete(`purge_confirm_${amount}_${targetUser?.id || 'all'}`);
      client.buttonHandlers.delete('purge_cancel');
    });
  },
};
