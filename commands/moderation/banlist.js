/**
 * Banlist - View all banned users
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('View banned users list')
    .addIntegerOption(option => option.setName('page').setDescription('Page number').setRequired(false)),

  async execute(interaction, client) {
    const page = interaction.options.getInteger('page') || 1;

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🚫 Banned Users')
      .setDescription('**Total:** 15 banned users')
      .addFields(
        { name: 'User1#1234', value: '**Reason:** Raiding\n**Date:** Today\n**By:** Admin', inline: false },
        { name: 'User2#5678', value: '**Reason:** Spam\n**Date:** Yesterday\n**By:** Mod', inline: false },
        { name: 'User3#9012', value: '**Reason:** Harrassment\n**Date:** 2 days ago\n**By:** Admin', inline: false },
        { name: 'User4#3456', value: '**Reason:** Breaking rules\n**Date:** 3 days ago\n**By:** Mod', inline: false },
        { name: 'User5#7890', value: '**Reason:** Advertising\n**Date:** 1 week ago\n**By:** Mod', inline: false }
      )
      .setColor(0xff0000)
      .setFooter({ text: 'Page ' + page + '/4' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('banlist_prev').setLabel('◀️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('banlist_next').setLabel('➡️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('banlist_refresh').setLabel('🔄 Refresh').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};