const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Vdeafen command - Voice deafen
module.exports = {
  data: new SlashCommandBuilder()
    .setName('vdeafen')
    .setDescription('Deafen a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to voice deafen')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for deafen')
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
      await member.voice.setDeaf(true, reason);
      
      const embed = new EmbedBuilder()
        .setTitle('🔇 User Voice Deaffened')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${user}`, inline: true },
          { name: 'Channel', value: member.voice.channel.name, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setFooter({ text: `Deafened by ${interaction.user.tag}` });
      
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