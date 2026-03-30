const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Slowmode command - set slowmode interval for a channel
module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode interval for a channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode in seconds (0 to disable)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to set slowmode for (defaults to current channel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for setting slowmode')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    try {
      await channel.setRateLimitPerUser(seconds, reason);
      
      const slowmodeText = seconds === 0 ? 'Disabled' : `${seconds} second${seconds !== 1 ? 's' : ''}`;
      console.log(`[Slowmode] Set to ${seconds}s for ${channel.name} in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setTitle('⏱️ Slowmode Set')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Slowmode', value: slowmodeText, inline: true },
          { name: 'Reason', value: reason, inline: true }
        ));
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel && logChannel.id !== channel.id) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error setting slowmode: ${error.message}`,
        ephemeral: true
      });
    }
  }
};