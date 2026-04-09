import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { enableRaidMode, disableRaidMode, getRaidStatus } from '../../handlers/raidHandler.js';

export default {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setNameLocalizations({ fr: 'antiraid', 'en-US': 'antiraid' })
    .setDescription('Gère la protection anti-raid du serveur (alias de /raidmode)')
    .addStringOption(option =>
      option.setName('action')
        .setNameLocalizations({ fr: 'action', 'en-US': 'action' })
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Activer', value: 'enable' },
          { name: 'Désactiver', value: 'disable' },
          { name: 'Statut', value: 'status' }
        )
    ),
  name: 'antiraid',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const action = interaction.options.getString('action');
      const guildId = interaction.guild.id;

      if (action === 'status') {
        const status = await getRaidStatus(guildId);
        const embed = new EmbedBuilder()
          .setTitle('🛡️ Statut Anti-Raid')
          .setColor(status.active ? 0xFF0000 : 0x00AE86)
          .addFields(
            { name: 'Protection Anti-Raid', value: status.active ? '✅ Activée' : '❌ Désactivée', inline: true },
            { name: 'Niveau', value: status.level || 'Normal', inline: true },
            { name: 'Activé le', value: status.enabledAt ? new Date(status.enabledAt).toLocaleString('fr-FR') : 'N/A', inline: true }
          )
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (action === 'enable') {
        const confirmButton = new ButtonBuilder()
          .setCustomId('antiraid_confirm_enable')
          .setLabel('Confirmer l\'activation')
          .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
          .setCustomId('antiraid_cancel')
          .setLabel('Annuler')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        const embed = new EmbedBuilder()
          .setTitle('⚠️ Confirmation - Protection Anti-Raid')
          .setDescription('Êtes-vous sûr de vouloir **activer** la protection anti-raid ?')
          .setColor(0xFFAA00);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        client.buttonHandlers?.set('antiraid_confirm_enable', async (btnInteraction) => {
          try {
            await enableRaidMode(guildId, client);
            const config = client.guildConfigs.get(guildId) || {};
            config.antiRaid = true;
            client.guildConfigs.set(guildId, config);

            const successEmbed = new EmbedBuilder()
              .setTitle('✅ Protection Anti-Raid Activée')
              .setDescription('La protection anti-raid est maintenant **activée**.')
              .setColor(0x00FF00)
              .setTimestamp();

            await btnInteraction.update({ embeds: [successEmbed], components: [] });
          } catch (err) {
            console.error('Erreur enable antiraid:', err);
            await btnInteraction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
          }
        });

        client.buttonHandlers?.set('antiraid_cancel', async (btnInteraction) => {
          const cancelEmbed = new EmbedBuilder()
            .setTitle('❌ Opération annulée')
            .setDescription('L\'activation de la protection anti-raid a été annulée.')
            .setColor(0x808080);
          await btnInteraction.update({ embeds: [cancelEmbed], components: [] });
        });
        return;
      }

      if (action === 'disable') {
        const confirmButton = new ButtonBuilder()
          .setCustomId('antiraid_confirm_disable')
          .setLabel('Confirmer la désactivation')
          .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
          .setCustomId('antiraid_cancel')
          .setLabel('Annuler')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        const embed = new EmbedBuilder()
          .setTitle('⚠️ Confirmation - Désactiver Anti-Raid')
          .setDescription('Êtes-vous sûr de vouloir **désactiver** la protection anti-raid ?')
          .setColor(0xFFAA00);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        client.buttonHandlers?.set('antiraid_confirm_disable', async (btnInteraction) => {
          try {
            await disableRaidMode(guildId, client);
            const config = client.guildConfigs.get(guildId) || {};
            config.antiRaid = false;
            client.guildConfigs.set(guildId, config);

            const successEmbed = new EmbedBuilder()
              .setTitle('✅ Protection Anti-Raid Désactivée')
              .setDescription('La protection anti-raid est maintenant **désactivée**.')
              .setColor(0x00FF00)
              .setTimestamp();

            await btnInteraction.update({ embeds: [successEmbed], components: [] });
          } catch (err) {
            console.error('Erreur disable antiraid:', err);
            await btnInteraction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
          }
        });

        client.buttonHandlers?.set('antiraid_cancel', async (btnInteraction) => {
          const cancelEmbed = new EmbedBuilder()
            .setTitle('❌ Opération annulée')
            .setDescription('La désactivation de la protection anti-raid a été annulée.')
            .setColor(0x808080);
          await btnInteraction.update({ embeds: [cancelEmbed], components: [] });
        });
      }
    } catch (error) {
      console.error('Erreur antiraid:', error);
      await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
    }
  },
};
