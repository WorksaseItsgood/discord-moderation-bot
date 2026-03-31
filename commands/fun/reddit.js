/**
 * Reddit Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reddit')
    .setDescription('Get a reddit post')
    .addStringOption(option => option.setName('subreddit').setDescription('Subreddit name').setRequired(true)),
  
  async execute(interaction, client) {
    const subreddit = interaction.options.getString('subreddit');
    
    await interaction.reply({ content: `📱 Latest from r/${subreddit}: Post title...` });
  }
};