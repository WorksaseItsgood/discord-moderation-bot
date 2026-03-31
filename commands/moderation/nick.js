/**
 * Nick - Change nickname
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change a user\'s nickname')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option => option.setName('nickname').setDescription('New nickname').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    try {
      await member.setNickname(nickname);

      const embed = new EmbedBuilder()
        .setTitle('📛 Nickname Changed')
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '📛 New Nickname', value: nickname, inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0x00ff00);

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
    }
  }
};