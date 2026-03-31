/**
 * Suggest Command - Make a suggestion with voting buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { suggestion, info, COLORS } = require('../../utils/embedTemplates');
const { voteButtons, suggestionModal, createModal, textInput } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Make a suggestion for the server')
    .addStringOption(option =>
      option.setName('idea')
        .setDescription('Your suggestion')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const idea = interaction.options.getString('idea');
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // If no suggestion provided, show modal
    if (!idea) {
      const modal = createModal({
        customId: 'suggestion-modal',
        title: 'Make a Suggestion',
        components: [
          new ActionRowBuilder().addComponents(
            textInput({
              customId: 'suggestion-text',
              label: 'Your Suggestion',
              style: 2, // Paragraph
              placeholder: 'Share your idea for the server...',
              required: true,
              minLength: 10,
              maxLength: 2000
            })
          )
        ]
      });
      
      await interaction.showModal(modal);
      return;
    }
    
    // Process the suggestion
    await handleSuggestion(interaction, client, idea, botAvatar);
  }
};

/**
 * Handle the suggestion after receiving the text
 */
async function handleSuggestion(interaction, client, idea, botAvatar) {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  
  // Initialize suggestions storage
  if (!client.suggestions) {
    client.suggestions = new Map();
  }
  
  const guildSuggestions = client.suggestions.get(guildId) || [];
  
  // Create suggestion
  const suggestionData = {
    id: guildSuggestions.length + 1,
    suggestion: idea,
    author: {
      id: userId,
      username: interaction.user.username,
      avatar: interaction.user.displayAvatarURL()
    },
    upvotes: [],
    downvotes: [],
    status: 'pending',
    createdAt: Date.now()
  };
  
  guildSuggestions.push(suggestionData);
  client.suggestions.set(guildId, guildSuggestions);
  
  // Create suggestion embed
  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setAuthor({
      name: `💡 Suggestion by ${interaction.user.username}`,
      iconURL: botAvatar
    })
    .setTitle('💡 New Suggestion')
    .setDescription(idea)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setFooter({
      text: 'CrowBot • 👍 0 • 👎 0',
      iconURL: botAvatar
    })
    .setTimestamp()
    .addFields(
      { name: '👤 Author', value: interaction.user.toString(), inline: true },
      { name: '📊 Status', value: '⏳ Pending', inline: true },
      { name: '👍 Upvotes', value: '0', inline: true },
      { name: '👎 Downvotes', value: '0', inline: true }
    );
  
  // Create vote buttons
  const buttonRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`suggest-upvote-${suggestionData.id}`)
        .setLabel('👍 Upvote')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`suggest-downvote-${suggestionData.id}`)
        .setLabel('👎 Downvote')
        .setStyle(ButtonStyle.Danger)
    );
  
  // Send to suggestions channel or reply
  const suggestChannel = interaction.guild.channels.cache.find(ch => 
    ch.name === 'suggestions' || ch.name === 'suggestion-box'
  );
  
  if (suggestChannel) {
    await suggestChannel.send({ embeds: [embed], components: [buttonRow] });
    
    const successEmbed = info('💡 Suggestion Submitted', `Your suggestion has been posted to ${suggestChannel}!`, {
      thumbnail: botAvatar
    });
    
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  } else {
    // Reply directly with buttons
    await interaction.reply({ embeds: [embed], components: [buttonRow] });
  }
}

module.exports.handleSuggestion = handleSuggestion;