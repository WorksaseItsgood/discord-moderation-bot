/**
 * Disconnect - Disconnect user from voice
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect user from voice')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member || !member.voice.channel) {
      return interaction.reply({ content: '❌ User not in voice!', ephemeral: true });
    }

    try {
      await member.voice.disconnect();

      const embed = new EmbedBuilder()
        .setTitle('👢 Disconnected')
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0x00ff00);

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
    }
  }
};