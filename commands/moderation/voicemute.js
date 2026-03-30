const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Voicemute command - mute a user in voice
module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemute')
    .setDescription('Mute a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to voice mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for voicemute')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.MuteMembers],
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
      await member.voice.setMute(true, reason);
      
      console.log(`[Voicemute] ${user.tag} muted in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setTitle('🔇 Voice Muted')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        ));
      
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
        content: `❌ Error voice muting user: ${error.message}`,
        ephemeral: true
      });
    }
  }
};