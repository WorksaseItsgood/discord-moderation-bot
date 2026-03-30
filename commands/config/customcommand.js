const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Custom command management
module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcommand')
    .setDescription('Manage custom commands')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
          { name: 'List', value: 'list' }
        ))
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Command name')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('response')
        .setDescription('Response message')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const name = interaction.options.getString('name');
    const response = interaction.options.getString('response');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    switch (action) {
      case 'add':
        if (!name || !response) {
          return interaction.reply({ content: '❌ Please provide both command name and response!', ephemeral: true });
        }
        
        db.addCustomCommand(guildId, name.toLowerCase(), response, interaction.user.id);
        
        await interaction.reply(`✅ Custom command \`${name}\` created with response:\n${response}`);
        break;
        
      case 'remove':
        if (!name) {
          return interaction.reply({ content: '❌ Please provide command name!', ephemeral: true });
        }
        
        db.deleteCustomCommand(guildId, name.toLowerCase());
        
        await interaction.reply(`✅ Command \`${name}\` removed!`);
        break;
        
      case 'list':
        const commands = db.getCustomCommands(guildId);
        
        if (commands.length === 0) {
          return interaction.reply({ content: 'No custom commands!', ephemeral: true });
        }
        
        const list = commands.map(c => `\`${c.name}\` - ${c.response.substring(0, 50)}${c.response.length > 50 ? '...' : ''}`).join('\n');
        
        const embed = new EmbedBuilder()
          .setTitle('Custom Commands')
          .setColor(0x00ff00)
          .setDescription(list);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
    }
  }
};