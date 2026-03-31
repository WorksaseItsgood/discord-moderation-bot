/**
 * Giveaway Command - Interactive giveaways with buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { giveaway, info, COLORS } = require('../../utils/embedTemplates');
const { giveawayDurationButtons, giveawayWinnerButtons, primaryButton, confirmButton, cancelButton } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(false)
        .addChoices(
          { name: '🎁 Create Giveaway', value: 'create' },
          { name: '📋 List Giveaways', value: 'list' }
        )),
  
  async execute(interaction, client) {
    const action = interaction.options.getString('action') || 'list';
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    if (action === 'list') {
      // List giveaways
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setAuthor({
          name: '🎁 Giveaways',
          iconURL: botAvatar
        })
        .setTitle('Active Giveaways')
        .setDescription('No active giveaways. Create one!')
        .setThumbnail(botAvatar)
        .setFooter({
          text: 'CrowBot',
          iconURL: botAvatar
        })
        .setTimestamp();
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('giveaway-create')
            .setLabel('🎁 Create Giveaway')
            .setStyle(ButtonStyle.Success)
        );
      
      await interaction.reply({ embeds: [embed], components: [buttonRow] });
    }
  }
};

/**
 * Interactive giveaway creation flow
 */
async function createGiveaway(interaction, client) {
  const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
  
  // Step 1: Ask for prize
  const step1Embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setAuthor({
      name: '🎁 Create Giveaway',
      iconURL: botAvatar
    })
    .setTitle('🎁 Step 1: Prize')
    .setDescription('What would you like to give away?\n\nEnter the prize name in your message.')
    .setFooter({
      text: 'CrowBot',
      iconURL: botAvatar
    })
    .setTimestamp();
  
  await interaction.reply({ embeds: [step1Embed] });
  
  // Continue in collector...
}

module.exports.createGiveaway = createGiveaway;