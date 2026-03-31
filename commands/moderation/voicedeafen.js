/**
 * Voice Deafen
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicedeafen')
    .setDescription('Deafen a user in voice')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    try {
      await member.voice.setDeaf(true);

      const embed = new EmbedBuilder()
        .setTitle('🔊 Voice Deafen')
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0xffaa00);

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
    }
  }
};