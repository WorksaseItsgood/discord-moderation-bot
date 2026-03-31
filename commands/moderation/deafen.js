const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Deafen command - deafen a user in voice
module.exports = {
  data: new SlashCommandBuilder()
    .setName('deafen')
    .setDescription('Deafen a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to deafen')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for deafen')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.DeafenMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server!',
        ephemeral: true
      });
    }
    
    const voiceState = member.voice;
    if (!voiceState.channelId) {
      return interaction.reply({
        content: '❌ User is not in a voice channel!',
        ephemeral: true
      });
    }
    
    try {
      await member.voice.setDeaf(true, reason);
      
      console.log(`[Deafen] ${user.tag} deafened in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setTitle('🔇 Deafened')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        );
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error deafening user: ${error.message}`,
        ephemeral: true
      });
    }
  }
};