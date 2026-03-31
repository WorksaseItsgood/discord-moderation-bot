/**
 * Unbanall - Unban all users
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unbanall')
    .setDescription('Unban all banned users')
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'Mass unban';

    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
    }

    await interaction.deferReply();

    const bans = await interaction.guild.bans.fetch();
    let count = 0;

    for (const [id, banEntry] of bans) {
      try {
        await interaction.guild.bans.remove(id);
        count++;
      } catch (e) {}
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Mass Unban Complete')
      .setDescription('**Unbanned:** ' + count + ' users')
      .addFields(
        { name: '👮 By', value: interaction.user.tag, inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
      )
      .setColor(0x00ff00);

    await interaction.editReply({ embeds: [embed] });
  }
};