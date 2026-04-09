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

    const userId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      if (btn.customId === `lock_confirm_${channel.id}`) {
        try {
          const everyoneRole = interaction.guild.roles.everyone;

          await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: false,
            AddReactions: false,
          }, { reason: `Verrouillé par ${interaction.user.tag}` });

          await btn.editReply({
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
          await btn.editReply({
            embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
            components: [],
          });
        }
      } else if (btn.customId === 'lock_cancel') {
        await btn.editReply({
          embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Verrouillage annulé.')],
          components: [],
        });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
