const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Slowmode command - Enhanced with exempt roles
module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode with exempt roles')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Seconds between messages (0-21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600))
    .addRoleOption(option =>
      option.setName('exempt_role')
        .setDescription('Role exempt from slowmode')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');
    const exemptRole = interaction.options.getRole('exempt_role');
    const channel = interaction.channel;
    
    await channel.setRateLimitPerUser(seconds);
    
    const embed = new EmbedBuilder()
      .setTitle('Slowmode Set')
      .setColor(0x3498db)
      .setDescription('Slowmode set to ' + seconds + ' seconds in ' + channel.toString())
      .addFields([{ name: 'Exempt Role', value: exemptRole ? exemptRole.toString() : 'None', inline: true }]);
    
    await interaction.reply({ embeds: [embed] });
  }
};