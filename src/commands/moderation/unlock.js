/**
 * /unlock - Déverrouiller un salon
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setNameLocalizations({ fr: 'unlock', 'en-US': 'unlock' })
    .setDescription('Déverrouiller un salon')
    .setDescriptionLocalizations({ fr: 'Déverrouiller un salon', 'en-US': 'Unlock a channel' })
    .addChannelOption(option =>
      option.setName('channel')
        .setNameLocalizations({ fr: 'salon', 'en-US': 'channel' })
        .setDescription('Le salon à déverrouiller (défaut: salon actuel)')
        .setDescriptionLocalizations({ fr: 'Le salon à déverrouiller (défaut: salon actuel)', 'en-US': 'The channel to unlock (default: current channel)' })
        .setRequired(false)),
  name: 'unlock',
  permissions: { user: [PermissionFlagsBits.ManageChannels], bot: [PermissionFlagsBits.ManageChannels] },

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔓 Confirmation de déverrouillage')
      .setColor(0x00cc00)
      .addFields(
        { name: 'Salon', value: `${channel.name} (${channel.id})`, inline: true }
      )
      .setDescription('⚠️ Cela permettra à @everyone d\'envoyer des messages dans ce salon.')
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`unlock_confirm_${channel.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('unlock_cancel')
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
      if (btn.customId === `unlock_confirm_${channel.id}`) {
        try {
          const everyoneRole = interaction.guild.roles.everyone;

          await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: null,
            AddReactions: null,
          }, { reason: `Déverrouillé par ${interaction.user.tag}` });

          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle('🔓 Salon déverrouillé')
              .setDescription(`Le salon ${channel} a été déverrouillé.\n@everyone peut à nouveau envoyer des messages.`)
              .setTimestamp()],
            components: [],
          });

          const { addLog } = await import('../../../database/db.js');
          await addLog(interaction.guild.id, {
            action: 'unlock',
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
      } else if (btn.customId === 'unlock_cancel') {
        await btn.editReply({
          embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Déverrouillage annulé.')],
          components: [],
        });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
