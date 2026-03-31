/**
 * GitHub Command - Show GitHub info
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Get GitHub repository info')
    .addStringOption(option =>
      option.setName('repo')
        .setDescription('Repository (owner/repo)')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const repo = interaction.options.getString('repo');
    
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { 'User-Agent': 'DiscordBot' }
      });
      const data = await res.json();
      
      if (data.message) {
        return interaction.reply({ content: 'Repository not found!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`🐙 ${data.full_name}`)
        .setDescription(data.description || 'No description')
        .addFields(
          { name: '⭐ Stars', value: data.stargazers_count.toString() },
          { name: '🍴 Forks', value: data.forks_count.toString() },
          { name: '👁️ Watchers', value: data.watchers_count.toString() },
          { name: '📂 Language', value: data.language || 'N/A' },
          { name: '🔗 Link', value: data.html_url }
        )
        .setColor(0x0099ff);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch repository!', ephemeral: true });
    }
  }
};