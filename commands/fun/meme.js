const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Meme command - Reddit meme
module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from Reddit')
    .addStringOption(option =>
      option.setName('subreddit')
        .setDescription('Subreddit to get meme from')
        .setRequired(false)),
  async execute(interaction, client) {
    const subreddit = interaction.options.getString('subreddit') || 'memes';
    
    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`);
      const data = await response.json();
      
      if (!data || !data[0] || !data[0].data || !data[0].data.children.length) {
        return interaction.reply({ content: '❌ Could not fetch meme!', ephemeral: true });
      }
      
      const post = data[0].data.children[0].data;
      
      if (post.is_video) {
        return interaction.reply({ content: '❌ Video posts are not supported!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(post.title)
        .setColor(0xff4500)
        .setURL(`https://reddit.com${post.permalink}`)
        .setAuthor({ name: `r/${post.subreddit}` })
        .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments}` });
      
      if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.jpeg') || post.url.endsWith('.png') || post.url.endsWith('.gif') || post.url.startsWith('https://i.redd.it'))) {
        embed.setImage(post.url);
      }
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Meme command error:', error);
      await interaction.reply({ content: '❌ Could not fetch meme!', ephemeral: true });
    }
  }
};