const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Kick a user from voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick from voice')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.MoveMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      const errEmbedResponse = errorEmbed('User Not Found', 'User not found in this server!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    if (!member.voice.channel) {
      const errEmbedResponse = errorEmbed('Not in Voice', 'User is not in a voice channel!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    try {
      await member.voice.disconnect(reason);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.MOD)
        .setTitle('🔊 Kicked from Voice')
        .setDescription(`${user.tag} has been kicked from voice`)
        .addFields(
          { name: 'User', value: user.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs');
      if (logChannel) await logChannel.send({ embeds: [embed] });
    } catch (err) {
      const errEmbedResponse = errorEmbed('VoiceKick Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};