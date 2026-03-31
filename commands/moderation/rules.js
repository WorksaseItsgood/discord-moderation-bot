/**
 * Rules Command - Display server rules
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Display server rules'),
  
  async execute(interaction, client) {
    const dbManager = client.dbManager;
    let rules = [];
    
    if (dbManager) {
      rules = dbManager.getSetting('server_rules', interaction.guildId) || [];
    }
    
    // Default rules if none set
    if (rules.length === 0) {
      rules = [
        "1. Be respectful to others",
        "2. No spamming or spam advertising",
        "3. No NSFW or inappropriate content",
        "4. Use appropriate language",
        "5. No politics or controversial topics",
        "6. Follow Discord ToS",
        "7. Listen to staff members",
        "8. Have fun!"
      ];
    }
    
    const embed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription(rules.join('\n'))
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};