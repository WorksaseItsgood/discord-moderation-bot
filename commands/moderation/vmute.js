const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Vmute command - Voice mute
module.exports = {
  data: new SlashCommandBuilder()
    .setName('vmute')
    .setDescription('Mute a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to voice mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for mute')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.MuteMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      return interaction.reply({ 
        content: '❌ User not found in server!',
        ephemeral: true 
      });
    }
    
    if (!member.voice.channel) {
      return interaction.reply({ 
        content: '❌ User is not in a voice channel!',
        ephemeral: true 
      });
    }
    
    try {
      await member.voice.setMute(true, reason);
      
      const embed = new EmbedBuilder()
        .setTitle('🔇 User Voice Muted')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${user}`, inline: true },
          { name: 'Channel', value: member.voice.channel.name, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setFooter({ text: `Muted by ${interaction.user.tag}` });
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};