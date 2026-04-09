import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { getWhitelist } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setNameLocalizations({ fr: 'whitelist', 'en-US': 'whitelist' })
    .setDescription('Afficher la liste blanche')
    .setDescriptionLocalizations({ fr: 'Afficher la liste blanche', 'en-US': 'Show the whitelist' })
    .setDMPermission(false),
  name: 'whitelist',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const guildId = interaction.guild.id;
      const whitelist = await getWhitelist(guildId);

      const itemsPerPage = 10;
      let currentPage = 0;

      const users = whitelist.filter(w => w.type === 'user');
      const roles = whitelist.filter(w => w.type === 'role');
      const channels = whitelist.filter(w => w.type === 'channel');

      const getPageContent = (page) => {
        const allItems = [...users.map(w => ({ ...w, label: 'Utilisateur' })), ...roles.map(w => ({ ...w, label: 'Rôle' })), ...channels.map(w => ({ ...w, label: 'Salon' }))];
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        return allItems.slice(start, end);
      };

      const totalPages = Math.ceil((users.length + roles.length + channels.length) / itemsPerPage);

      const generateEmbed = (page) => {
        const items = getPageContent(page);
        const description = items.length > 0
          ? items.map(item => `• **${item.label}:** <@${item.type === 'user' ? item.id : item.type === 'role' ? '&' + item.id : item.id}> (${item.id})`).join('\n')
          : 'Aucun élément dans la liste blanche.';

        return new EmbedBuilder()
          .setTitle('📋 Liste blanche')
          .setDescription(description)
          .setColor(0x3498db)
          .setFooter({ text: `Page ${page + 1}/${totalPages || 1} • ${users.length} utilisateurs, ${roles.length} rôles, ${channels.length} salons` })
          .setTimestamp();
      };

      const generateButtons = (page) => {
        const row = new ActionRowBuilder();
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('wl_prev')
            .setLabel('◀️ Précédent')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0));
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('wl_next')
            .setLabel('Suivant ▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1));
        return row;
      };

      const message = await interaction.reply({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [generateButtons(currentPage)] : [],
        ephemeral: true
      });

      if (totalPages <= 1) return;

      const collector = message.createMessageComponentCollector({
        filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
        time: 120000
      });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.customId === 'wl_prev') {
          currentPage--;
        } else if (btnInteraction.customId === 'wl_next') {
          currentPage++;
        }

        await btnInteraction.update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)]
        });
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder();
        disabledRow.addComponents(
          new ButtonBuilder()
            .setCustomId('wl_prev')
            .setLabel('◀️ Précédent')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true));
        disabledRow.addComponents(
          new ButtonBuilder()
            .setCustomId('wl_next')
            .setLabel('Suivant ▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true));

        await message.edit({ components: [disabledRow] }).catch(() => {});
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la liste blanche:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage de la liste blanche.', ephemeral: true });
    }
  },
};
