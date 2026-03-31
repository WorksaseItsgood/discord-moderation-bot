/**
 * NPM Command - NPM package info
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npm')
    .setDescription('Get NPM package info')
    .addStringOption(option =>
      option.setName('package')
        .setDescription('Package name')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const pkg = interaction.options.getString('package');
    
    try {
      const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
      const data = await res.json();
      
      if (data.error) {
        return interaction.reply({ content: 'Package not found!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`📦 ${data.name}`)
        .setDescription(data.description || 'No description')
        .addFields(
          { name: '📌 Version', value: data.version },
          { name: '⬇️ Downloads', value: 'Check npmjs.com' },
          { name: '🔗 Link', value: `https://www.npmjs.com/package/${pkg}` }
        )
        .setColor(0xcb3837);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch package!', ephemeral: true });
    }
  }
};