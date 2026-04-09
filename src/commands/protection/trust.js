import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trust')
    .setNameLocalizations({ fr: 'trust', 'en-US': 'trust' })
    .setDescription('Ajoute un utilisateur à la liste de confiance (exempt de la quarantaine anti-raid)')
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('Utilisateur à ajouter à la liste de confiance')
        .setRequired(true)
    ),
  name: 'trust',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user');
      const guildId = interaction.guild.id;
      const config = client.guildConfigs.get(guildId) || {};

      if (!config.trustedUsers) config.trustedUsers = [];

      const isAlreadyTrusted = config.trustedUsers.includes(user.id);

      if (isAlreadyTrusted) {
        const removeButton = new ButtonBuilder()
          .setCustomId('trust_remove')
          .setLabel(`Retirer ${user.tag}`)
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(removeButton);

        const embed = new EmbedBuilder()
          .setTitle('ℹ️ Utilisateur déjà fiable')
          .setDescription(`${user.tag} est déjà dans la liste de confiance.`)
          .setColor(0xFFAA00);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        client.buttonHandlers?.set('trust_remove', async (btnInteraction) => {
          try {
            config.trustedUsers = config.trustedUsers.filter(id => id !== user.id);
            client.guildConfigs.set(guildId, config);

            const successEmbed = new EmbedBuilder()
              .setTitle('✅ Utilisateur retiré')
              .setDescription(`${user.tag} a été retiré de la liste de confiance.`)
              .setColor(0x00FF00)
              .setTimestamp();

            await btnInteraction.update({ embeds: [successEmbed], components: [] });
          } catch (err) {
            console.error('Erreur remove trust:', err);
            await btnInteraction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
          }
        });
        return;
      }

      const confirmButton = new ButtonBuilder()
        .setCustomId('trust_confirm')
        .setLabel(`Ajouter ${user.tag}`)
        .setStyle(ButtonStyle.Success);

      const cancelButton = new ButtonBuilder()
        .setCustomId('trust_cancel')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

      const embed = new EmbedBuilder()
        .setTitle('🤝 Ajouter à la liste de confiance')
        .setDescription(`Voulez-vous ajouter **${user.tag}** à la liste de confiance ?\n\nCet utilisateur sera exempté de la quarantaine anti-raid.`)
        .setColor(0x00AE86);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

      client.buttonHandlers?.set('trust_confirm', async (btnInteraction) => {
        try {
          if (!config.trustedUsers) config.trustedUsers = [];
          config.trustedUsers.push(user.id);
          client.guildConfigs.set(guildId, config);

          const successEmbed = new EmbedBuilder()
            .setTitle('✅ Utilisateur fiable ajouté')
            .setDescription(`**${user.tag}** a été ajouté à la liste de confiance.\n\nCet utilisateur sera exempté de la quarantaine anti-raid.`)
            .setColor(0x00FF00)
            .setTimestamp();

          await btnInteraction.update({ embeds: [successEmbed], components: [] });
        } catch (err) {
          console.error('Erreur add trust:', err);
          await btnInteraction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
        }
      });

      client.buttonHandlers?.set('trust_cancel', async (btnInteraction) => {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('❌ Opération annulée')
          .setDescription(`L'ajout de ${user.tag} à la liste de confiance a été annulé.`)
          .setColor(0x808080);
        await btnInteraction.update({ embeds: [cancelEmbed], components: [] });
      });
    } catch (error) {
      console.error('Erreur trust:', error);
      await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
    }
  },
};
