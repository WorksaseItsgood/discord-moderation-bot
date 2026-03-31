/**
 * Voicekick - Kick from voice
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Kick user from voice channel')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Voice kick';

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    try {
      await member.voice.disconnect();

      const embed = new EmbedBuilder()
        .setTitle('👢 Kicked from Voice')
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '📝 Reason', value: reason, inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0xff6600);

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
    }
  }
};