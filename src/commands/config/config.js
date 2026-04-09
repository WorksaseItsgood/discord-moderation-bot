import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setNameLocalizations({ fr: 'config', 'en-US': 'config' })
    .setDescription('Afficher la configuration du serveur')
    .setDescriptionLocalizations({ fr: 'Afficher la configuration du serveur', 'en-US': 'Show server configuration' })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'config',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const guildId = interaction.guild.id;
      const config = client.guildConfigs.get(guildId) || {};

      let currentSection = 'general';

      const generateEmbed = (section) => {
        const embed = new EmbedBuilder()
          .setTitle(`⚙️ Configuration - ${section.charAt(0).toUpperCase() + section.slice(1)}`)
          .setColor(0x3498db)
          .setTimestamp();

        if (section === 'general') {
          embed.setDescription(`**Préfixe:** \`${config.prefix || '/'}\`\n**Rôle muet:** ${config.mutedRole ? `<@&${config.mutedRole}>` : 'Non défini'}`);
        } else if (section === 'protection') {
          embed.setDescription(
            `**Anti-Spam:** ${config.antiSpamEnabled ? `✅ Activé (seuil: ${config.antiSpamThreshold || 5})` : '❌ Désactivé'}\n` +
            `**Seuil Raid:** ${config.raidThreshold || 'Non défini'}\n` +
            `**Seuil Derank:** ${config.derankThreshold ? `${config.derankThreshold}%` : 'Non défini'}`
          );
        } else if (section === 'logs') {
          embed.setDescription(`**Salon des logs:** ${config.modLogChannel ? `<#${config.modLogChannel}>` : 'Non défini'}`);
        } else if (section === 'whitelist') {
          embed.setDescription('Utilisez la commande `/whitelist` pour voir les éléments de la liste blanche.');
        }

        return embed;
      };

      const generateButtons = (section) => {
        const row = new ActionRowBuilder();
        ['general', 'protection', 'logs', 'whitelist'].forEach(sec => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`config_${sec}`)
              .setLabel(sec.charAt(0).toUpperCase() + sec.slice(1))
              .setStyle(section === sec ? ButtonStyle.Primary : ButtonStyle.Secondary)
          );
        });
        return row;
      };

      const message = await interaction.reply({
        embeds: [generateEmbed(currentSection)],
        components: [generateButtons(currentSection)],
        ephemeral: true
      });

      const collector = message.createMessageComponentCollector({
        filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
        time: 180000
      });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.customId.startsWith('config_')) {
          currentSection = btnInteraction.customId.replace('config_', '');
          await btnInteraction.update({
            embeds: [generateEmbed(currentSection)],
            components: [generateButtons(currentSection)]
          });
        }
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder();
        ['general', 'protection', 'logs', 'whitelist'].forEach(sec => {
          disabledRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`config_${sec}`)
              .setLabel(sec.charAt(0).toUpperCase() + sec.slice(1))
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );
        });
        await message.edit({ components: [disabledRow] }).catch(() => {});
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la configuration:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage de la configuration.', ephemeral: true });
    }
  },
};
