/**
 * Steal Emoji Command - Steal emoji from other servers
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal-emoji')
    .setDescription('Steal an emoji from another server')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji to steal')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name for the emoji')
        .setRequired(false)
    ),
  permissions: ['ManageEmojisAndStickers'],
  
  async execute(interaction, client) {
    const emojiStr = interaction.options.getString('emoji');
    const name = interaction.options.getString('name') || 'stolenemoji';
    
    // Try to find the emoji from a message in the guild
    let emojiUrl = null;
    let emojiName = name;
    
    // Parse custom emoji
    const customEmojiMatch = emojiStr.match(/<a?:\w+:(\d+)>/);
    if (customEmojiMatch) {
      const emojiId = customEmojiMatch[1];
      const animated = emojiStr.startsWith('<a:');
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}?size=128`;
    } else {
      return interaction.reply({ content: 'Please provide a custom emoji from a server!', ephemeral: true });
    }
    
    try {
      const response = await fetch(emojiUrl);
      const buffer = await response.arrayBuffer();
      
      if (interaction.guild.emojis.cache.size >= interaction.guild.emojiLimit) {
        return interaction.reply({ content: 'This server has reached the emoji limit!', ephemeral: true });
      }
      
      await interaction.guild.emojis.create({ attachment: Buffer.from(buffer), name: emojiName });
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Emoji Stolen!')
        .setDescription(`Added emoji: \`:${emojiName}:\``)
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('[Steal Emoji] Error:', error);
      await interaction.reply({ content: 'Failed to steal emoji. Make sure the emoji is from a server the bot can see.', ephemeral: true });
    }
  }
};