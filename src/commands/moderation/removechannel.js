/**
 * /removechannel - Supprimer un salon
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  name: 'removechannel',
  description: 'Supprimer un salon',
  permissions: {
    user: [PermissionFlagsBits.ManageChannels],
    bot: [PermissionFlagsBits.ManageChannels],
  },

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!channel) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff0000)
          .setDescription('❌ Veuillez spécifier un salon à supprimer.')],
        ephemeral: true,
      });
    }

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🗑️ Confirmation de suppression de salon')
      .setColor(0xff6600)
      .addFields(
        { name: 'Salon', value: `${channel.name} (${channel.id})`, inline: true },
        { name: 'Type', value: channel.type.toString(), inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`removechannel_confirm_${channel.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('removechannel_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({
      embeds: [confirmEmbed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      if (btn.customId === `removechannel_confirm_${channel.id}`) {
        try {
          const channelName = channel.name;
          await channel.delete(`${reason} | Supprimé par ${interaction.user.tag}`);

          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle('✅ Salon supprimé')
              .setDescription(`Le salon **${channelName}** a été supprimé.\nRaison: ${reason}`)
              .setTimestamp()],
            components: [],
          });

          const { addLog } = await import('../../../database/db.js');
          await addLog(interaction.guild.id, {
            action: 'removechannel',
            channelName,
            channelId: channel.id,
            moderatorId: interaction.user.id,
            reason,
            timestamp: Date.now(),
          });
        } catch (err) {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('❌ Erreur')
              .setDescription(err.message)
              .setTimestamp()],
            components: [],
          });
        }
      } else if (btn.customId === 'removechannel_cancel') {
        await btn.editReply({
          embeds: [new EmbedBuilder()
            .setColor(0x808080)
            .setDescription('❌ Suppression de salon annulée.')],
          components: [],
        });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
