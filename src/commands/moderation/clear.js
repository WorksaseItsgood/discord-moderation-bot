/**
 * /clear - Supprimer des messages d'un salon
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setNameLocalizations({ fr: 'clear', 'en-US': 'clear' })
    .setDescription('Supprimer des messages d\'un salon')
    .setDescriptionLocalizations({ fr: 'Supprimer des messages d\'un salon', 'en-US': 'Delete messages from a channel' })
    .addIntegerOption(option =>
      option.setName('amount')
        .setNameLocalizations({ fr: 'nombre', 'en-US': 'amount' })
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setDescriptionLocalizations({ fr: 'Nombre de messages à supprimer (1-100)', 'en-US': 'Number of messages to delete (1-100)' })
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('Filtrer par utilisateur (optionnel)')
        .setDescriptionLocalizations({ fr: 'Filtrer par utilisateur (optionnel)', 'en-US': 'Filter by user (optional)' })
        .setRequired(false)),
  name: 'clear',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    if (!amount || amount < 1 || amount > 100) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un nombre entre 1 et 100.')],
        ephemeral: true,
      });
    }

    const filterDesc = targetUser ? `de **${targetUser.tag}**` : '';
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🗑️ Confirmation de suppression')
      .setColor(0xff6600)
      .addFields(
        { name: 'Nombre', value: `${amount} message(s)`, inline: true },
        { name: 'Utilisateur', value: targetUser ? `${targetUser.tag}` : 'Tous', inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`clear_confirm_${amount}_${targetUser?.id || 'all'}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('clear_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`clear_confirm_${amount}_${targetUser?.id || 'all'}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const channel = interaction.channel;
        let deleted = 0;

        if (targetUser) {
          const messages = await channel.messages.fetch({ limit: 100 });
          const userMessages = messages.filter(m => m.author.id === targetUser.id);
          const toDelete = userMessages.first(amount);

          for (const msg of toDelete) {
            try {
              await msg.delete();
              deleted++;
            } catch {}
          }
        } else {
          const messages = await channel.messages.fetch({ limit: amount });
          for (const msg of messages.values()) {
            try {
              await msg.delete();
              deleted++;
            } catch {}
          }
        }

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🗑️ Messages supprimés')
            .setDescription(`${deleted} message(s) supprimé(s)${targetUser ? ` de **${targetUser.tag}**` : ''}.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'clear',
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

      client.buttonHandlers.delete(`clear_confirm_${amount}_${targetUser?.id || 'all'}`);
      client.buttonHandlers.delete('clear_cancel');
    });

    client.buttonHandlers.set('clear_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Suppression annulée.')],
        components: [],
      });
      client.buttonHandlers.delete(`clear_confirm_${amount}_${targetUser?.id || 'all'}`);
      client.buttonHandlers.delete('clear_cancel');
    });
  },
};
