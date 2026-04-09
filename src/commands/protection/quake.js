import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('quake')
    .setNameLocalizations({ fr: 'quake', 'en-US': 'quake' })
    .setDescription('Verrouillage d\'urgence de tous les salons (urgence maximale)'),
  name: 'quake',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const guildId = guild.id;

      const confirmButton = new ButtonBuilder()
        .setCustomId('quake_confirm')
        .setLabel('⚠️ Confirmer le Quake')
        .setStyle(ButtonStyle.Danger);

      const cancelButton = new ButtonBuilder()
        .setCustomId('quake_cancel')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

      const embed = new EmbedBuilder()
        .setTitle('⚠️⚠️⚠️ ALERTE QUAKE - Confirmation Requise ⚠️⚠️⚠️')
        .setDescription('**ATTENTION: Cette action va verrouiller TOUS les salons du serveur !**\n\n• Les membres ne pourront plus envoyer de messages\n• Les membres ne pourront plus se connecter aux salons vocaux\n• Cette action est irréversible\n\nÊtes-vous sûr de vouloir continuer ?')
        .setColor(0xFF0000);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

      client.buttonHandlers?.set('quake_confirm', async (btnInteraction) => {
        try {
          const everyoneRole = guild.roles.everyone;
          const channels = guild.channels.cache;
          const config = client.guildConfigs.get(guildId) || {};

          if (!config.quakeData) config.quakeData = {};

          for (const [channelId, channel] of channels) {
            const currentPerms = channel.permissionOverwrites.cache.get(everyoneRole.id);
            config.quakeData[channelId] = {
              originalPerms: currentPerms?.serialize() || {},
              lockedAt: new Date().toISOString()
            };

            await channel.permissionOverwrites.edit(everyoneRole, {
              SendMessages: false,
              Connect: false,
              AddReactions: false,
              Speak: false
            }).catch(() => {});
          }

          config.ultraShield = true;
          client.guildConfigs.set(guildId, config);

          const successEmbed = new EmbedBuilder()
            .setTitle('🔒🔒🔒 SERVEUR EN QUAKE LOCKDOWN 🔒🔒🔒')
            .setDescription(`**Tous les salons ont été verrouillés avec succès !**\n\n• ${channels.size} salons verrouillés\n• Date: ${new Date().toLocaleString('fr-FR')}`)
            .setColor(0xFF0000)
            .setTimestamp();

          await btnInteraction.update({ embeds: [successEmbed], components: [] });
        } catch (err) {
          console.error('Erreur quake:', err);
          await btnInteraction.reply({ content: '❌ Une erreur est survenue lors du verrouillage.', ephemeral: true });
        }
      });

      client.buttonHandlers?.set('quake_cancel', async (btnInteraction) => {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('❌ Opération annulée')
          .setDescription('Le quake lockdown a été annulé. Le serveur n\'a pas été affecté.')
          .setColor(0x808080);
        await btnInteraction.update({ embeds: [cancelEmbed], components: [] });
      });
    } catch (error) {
      console.error('Erreur quake:', error);
      await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
    }
  },
};
