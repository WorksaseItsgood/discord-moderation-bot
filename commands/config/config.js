/**
 * Config Command - Configure bot settings
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure bot settings')
    .addStringOption(option =>
      option.setName('setting')
        .setDescription('Setting to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome Channel', value: 'welcome_channel' },
          { name: 'Leave Channel', value: 'leave_channel' },
          { name: 'Welcome Message', value: 'welcome_message' },
          { name: 'Leave Message', value: 'leave_message' },
          { name: 'Auto Role', value: 'auto_role' },
          { name: 'Ticket Category', value: 'ticket_category' },
          { name: 'Ticket Log Channel', value: 'ticket_log_channel' },
          { name: 'Suggestion Channel', value: 'suggestion_channel' },
          { name: 'Verification Role', value: 'verify_role' },
          { name: 'Log Channel', value: 'log_channel' },
          { name: 'Mute Role', value: 'mute_role' },
          { name: 'Anti-Raid Enable', value: 'antiraid_enable' },
          { name: 'Auto-Mod Enable', value: 'automod_enable' }
        )
    )
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Setting value (channel ID, role ID, message, or on/off)')
    ),
  
  async execute(interaction, client) {
    const setting = interaction.options.getString('setting');
    const value = interaction.options.getString('value');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need ManageGuild permission!', ephemeral: true });
    }
    
    if (!value) {
      // Get current value
      const currentValue = client.dbManager.getSetting(setting, guildId);
      return interaction.reply({ 
        content: `**${setting}**: ${currentValue || 'Not set'}`,
        ephemeral: true 
      });
    }
    
    // Set value
    client.dbManager.setSetting(setting, guildId, value);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Configuration Updated')
      .setDescription(`**${setting}** has been set to **${value}**`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};