/**
 * /ban - Ban a user from the server
 */
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setNameLocalizations({ fr: 'ban', 'en-US': 'ban' })
    .setDescription('Ban a user from the server')
    .setDescriptionLocalizations({ fr: 'Bannir un utilisateur du serveur', 'en-US': 'Ban a user from the server' })
    .addUserOption(opt => opt.setName('user').setNameLocalizations({ fr: 'utilisateur' }).setDescription('User to ban').setDescriptionLocalizations({ fr: 'Utilisateur à bannir' }).setRequired(true))
    .addStringOption(opt => opt.setName('reason').setNameLocalizations({ fr: 'raison' }).setDescription('Ban reason').setDescriptionLocalizations({ fr: 'Raison du ban' }).setRequired(false))
    .addIntegerOption(opt => opt.setName('delete-days').setNameLocalizations({ fr: 'supprimer-jours' }).setDescription('Days of messages to delete').setDescriptionLocalizations({ fr: 'Jours de messages à supprimer' }).setRequired(false).setMinValue(0).setMaxValue(7)),
  name: 'ban',
  description: 'Ban a user from the server',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const deleteDays = interaction.options.getInteger('delete-days') || 0;

    if (!target) {
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur.')], ephemeral: true });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔨 Confirmation de ban')
      .setColor(0xff6600)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Raison', value: reason, inline: true },
        { name: 'Supprimer messages', value: `${deleteDays} jour(s)`, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder().setCustomId(`ban_confirm_${target.id}`).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger);
    const cancelBtn = new ButtonBuilder().setCustomId('ban_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`ban_confirm_${target.id}`, async (btn) => {
      if (btn.user.id !== interaction.user.id) return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      try {
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member) {
          await member.ban({ reason: `${reason} | Ban par ${interaction.user.tag}`, deleteMessageSeconds: deleteDays * 86400 });
        } else {
          await interaction.guild.members.ban(target.id, { reason: `${reason} | Ban par ${interaction.user.tag}` });
        }
        await btn.update({ embeds: [new EmbedBuilder().setColor(0x00ff00).setTitle('✅ Utilisateur banni').setDescription(`**${target.tag}** a été banni.\nRaison: ${reason}`).setTimestamp()], components: [] });
        const { addLog } = await import('../../database/db.js');
        await addLog(interaction.guild.id, { action: 'ban', userId: target.id, moderatorId: interaction.user.id, reason, timestamp: Date.now() });
      } catch (err) {
        await btn.update({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du ban').setDescription(err.message).setTimestamp()], components: [] });
      }
      client.buttonHandlers.delete(`ban_confirm_${target.id}`);
    });

    client.buttonHandlers.set('ban_cancel', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      await btn.update({ embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Ban annulé.')], components: [] });
      client.buttonHandlers.delete(`ban_confirm_${target.id}`);
      client.buttonHandlers.delete('ban_cancel');
    });
  },
};
