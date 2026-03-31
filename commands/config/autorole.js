/**
 * AutoroRole Command - Set auto role
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Set auto role for new members')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set the auto role')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to give').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable auto role')
    ),
  permissions: ['ManageRoles'],
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    const dbManager = client.dbManager;
    
    if (subcommand === 'set') {
      const role = interaction.options.getRole('role');
      
      if (dbManager) {
        dbManager.setSetting('autorole', interaction.guildId, role.id);
      }
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Auto Role Set')
        .setDescription(`New members will get: ${role}`)
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'disable') {
      if (dbManager) {
        dbManager.setSetting('autorole', interaction.guildId, null);
      }
      
      await interaction.reply('✅ Auto role disabled!');
    }
  }
};