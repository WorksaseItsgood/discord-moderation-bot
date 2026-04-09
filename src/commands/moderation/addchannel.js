/**
 * /addchannel - Ajouter un salon avec permissions
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  name: 'addchannel',
  description: 'Ajouter un salon avec permissions',
  permissions: {
    user: [PermissionFlagsBits.ManageChannels],
    bot: [PermissionFlagsBits.ManageChannels],
  },

  async execute(interaction, client) {
    const channelName = interaction.options.getString('name');
    const channelType = interaction.options.getString('type') || 'text';
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!channelName) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff0000)
          .setDescription('❌ Veuillez spécifier un nom pour le salon.')],
        ephemeral: true,
      });
    }

    const typeMap = {
      'text': 0,
      'voice': 2,
      'category': 4,
      'news': 5,
      'store': 6,
    };

    const channelTypeNumber = typeMap[channelType.toLowerCase()] ?? 0;

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('📝 Confirmation de création de salon')
      .setColor(0xff6600)
      .addFields(
        { name: 'Nom', value: channelName, inline: true },
        { name: 'Type', value: channelType, inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`addchannel_confirm_${channelName}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('addchannel_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true,
    });

    client.buttonHandlers.set(`addchannel_confirm_${channelName}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const newChannel = await interaction.guild.channels.create({
          name: channelName,
          type: channelTypeNumber,
          reason: `${reason} | Créé par ${interaction.user.tag}`,
        });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Salon créé')
            .setDescription(`Le salon **${newChannel.name}** a été créé.\nType: ${channelType}\nRaison: ${reason}`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'addchannel',
          channelId: newChannel.id,
          channelName: newChannel.name,
          channelType,
          moderatorId: interaction.user.id,
          reason,
          timestamp: Date.now(),
        });
      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Erreur')
            .setDescription(err.message)
            .setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`addchannel_confirm_${channelName}`);
      client.buttonHandlers.delete('addchannel_cancel');
    });

    client.buttonHandlers.set('addchannel_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      await btnInteraction.update({
        embeds: [new EmbedBuilder()
          .setColor(0x808080)
          .setDescription('❌ Création de salon annulée.')],
        components: [],
      });

      client.buttonHandlers.delete(`addchannel_confirm_${channelName}`);
      client.buttonHandlers.delete('addchannel_cancel');
    });
  },
};
