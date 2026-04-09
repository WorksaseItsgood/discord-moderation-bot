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
      if (btn.customId === `addchannel_confirm_${channelName}`) {
        try {
          const newChannel = await interaction.guild.channels.create({
            name: channelName,
            type: channelTypeNumber,
            reason: `${reason} | Créé par ${interaction.user.tag}`,
          });

          await btn.editReply({
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
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('❌ Erreur')
              .setDescription(err.message)
              .setTimestamp()],
            components: [],
          });
        }
      } else if (btn.customId === 'addchannel_cancel') {
        await btn.editReply({
          embeds: [new EmbedBuilder()
            .setColor(0x808080)
            .setDescription('❌ Création de salon annulée.')],
          components: [],
        });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
