/**
 * /lock - Verrouiller un salon (empêcher l'envoi de messages)
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setNameLocalizations({ fr: 'lock', 'en-US': 'lock' })
    .setDescription('Verrouiller un salon (empêcher l\'envoi de messages)')
    .setDescriptionLocalizations({ fr: 'Verrouiller un salon (empêcher l\'envoi de messages)', 'en-US': 'Lock a channel (prevent sending messages)' })
    .addChannelOption(option =>
      option.setName('channel')
        .setNameLocalizations({ fr: 'salon', 'en-US': 'channel' })
        .setDescription('Le salon à verrouiller (défaut: salon actuel)')
        .setDescriptionLocalizations({ fr: 'Le salon à verrouiller (défaut: salon actuel)', 'en-US': 'The channel to lock (default: current channel)' })
        .setRequired(false)),
  name: 'lock',
  permissions: { user: [PermissionFlagsBits.ManageChannels], bot: [PermissionFlagsBits.ManageChannels] },

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔒 Confirmation de verrouillage')
      .setColor(0xff6600)
      .addFields(
        { name: 'Salon', value: `${channel.name} (${channel.id})`, inline: true }
      )
      .setDescription('⚠️ Cela interdira à @everyone d\'envoyer des messages dans ce salon.')
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`lock_confirm_${channel.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('lock_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`lock_confirm_${channel.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const everyoneRole = interaction.guild.roles.everyone;

        await channel.permissionOverwrites.edit(everyoneRole, {
          SendMessages: false,
          AddReactions: false,
        }, { reason: `Verrouillé par ${interaction.user.tag}` });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🔒 Salon verrouillé')
            .setDescription(`Le salon ${channel} a été verrouillé.\n@everyone ne peut plus envoyer de messages.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'lock',
          channelId: channel.id,
          moderatorId: interaction.user.id,
          timestamp: Date.now(),
        });

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`lock_confirm_${channel.id}`);
      client.buttonHandlers.delete('lock_cancel');
    });

    client.buttonHandlers.set('lock_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Verrouillage annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`lock_confirm_${channel.id}`);
      client.buttonHandlers.delete('lock_cancel');
    });
  },
};
