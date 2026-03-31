/**
 * Button Components - Pre-built button components for interactive UI
 */

const { 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  UserSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder
} = require('discord.js');

// Button styles
const STYLES = {
  PRIMARY: ButtonStyle.Primary,
  SECONDARY: ButtonStyle.Secondary,
  SUCCESS: ButtonStyle.Success,
  DANGER: ButtonStyle.Danger,
  LINK: ButtonStyle.Link
};

// =====================
// BASIC BUTTONS
// =====================

/**
 * Create a success button
 */
function successButton(label, customId, emoji = '✅') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(STYLES.SUCCESS)
    .setEmoji(emoji);
}

/**
 * Create a danger button
 */
function dangerButton(label, customId, emoji = '❌') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(STYLES.DANGER)
    .setEmoji(emoji);
}

/**
 * Create a primary button
 */
function primaryButton(label, customId, emoji = null) {
  const btn = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(STYLES.PRIMARY);
  
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

/**
 * Create a secondary button
 */
function secondaryButton(label, customId, emoji = null) {
  const btn = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(STYLES.SECONDARY);
  
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

/**
 * Create a link button
 */
function linkButton(label, url, emoji = null) {
  const btn = new ButtonBuilder()
    .setURL(url)
    .setLabel(label)
    .setStyle(STYLES.LINK);
  
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

// =====================
// NAVIGATION BUTTONS
// =====================

/**
 * Create previous button
 */
function prevButton(customId = 'prev') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('⬅️ Previous')
    .setStyle(STYLES.SECONDARY);
}

/**
 * Create next button
 */
function nextButton(customId = 'next') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('Next ➡️')
    .setStyle(STYLES.SECONDARY);
}

/**
 * Create close button
 */
function closeButton(customId = 'close') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('✖️ Close')
    .setStyle(STYLES.DANGER);
}

/**
 * Create confirm button
 */
function confirmButton(customId = 'confirm') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('✅ Confirm')
    .setStyle(STYLES.SUCCESS);
}

/**
 * Create cancel button
 */
function cancelButton(customId = 'cancel') {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('❌ Cancel')
    .setStyle(STYLES.DANGER);
}

/**
 * Create pagination row
 */
function paginationRow(currentPage, totalPages, customIdPrefix = 'page') {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`${customIdPrefix}-${currentPage > 1 ? currentPage - 1 : 1}`)
        .setLabel('⬅️ Previous')
        .setStyle(STYLES.SECONDARY)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setLabel(`${currentPage}/${totalPages}`)
        .setStyle(STYLES.SECONDARY)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${customIdPrefix}-${currentPage < totalPages ? currentPage + 1 : totalPages}`)
        .setLabel('Next ➡️')
        .setStyle(STYLES.SECONDARY)
        .setDisabled(currentPage >= totalPages)
    );
}

// =====================
// CATEGORY BUTTONS
// =====================

/**
 * Create category buttons for help menu
 */
function categoryButtons(categories) {
  const rows = [];
  let currentRow = new ActionRowBuilder();
  
  for (const category of categories) {
    if (currentRow.components.length >= 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
    
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(category.customId)
        .setLabel(category.label)
        .setStyle(STYLES.SECONDARY)
        .setEmoji(category.emoji)
    );
  }
  
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Create moderation category buttons
 */
function moderationButtons() {
  return [
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mod-ban')
          .setLabel('🔨 Ban')
          .setStyle(STYLES.DANGER),
        new ButtonBuilder()
          .setCustomId('mod-kick')
          .setLabel('👢 Kick')
          .setStyle(STYLES.DANGER),
        new ButtonBuilder()
          .setCustomId('mod-mute')
          .setLabel('🔇 Mute')
          .setStyle(STYLES.SECONDARY),
        new ButtonBuilder()
          .setCustomId('mod-warn')
          .setLabel('⚠️ Warn')
          .setStyle(STYLES.SECONDARY)
      ),
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mod-warnings')
          .setLabel('📋 Warnings')
          .setStyle(STYLES.PRIMARY),
        new ButtonBuilder()
          .setCustomId('mod-lock')
          .setLabel('🔒 Lock')
          .setStyle(STYLES.SECONDARY),
        new ButtonBuilder()
          .setCustomId('mod-purge')
          .setLabel('🗑️ Purge')
          .setStyle(STYLES.DANGER)
      )
  ];
}

// =====================
// MUSIC BUTTONS
// =====================

/**
 * Create music control buttons
 */
function musicControls(paused = false) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('music-shuffle')
        .setLabel('🔀')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('music-prev')
        .setLabel('⏮️')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('music-playpause')
        .setLabel(paused ? '▶️ Play' : '⏸️ Pause')
        .setStyle(paused ? STYLES.SUCCESS : STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('music-skip')
        .setLabel('⏭️ Skip')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('music-queue')
        .setLabel('📋 Queue')
        .setStyle(STYLES.PRIMARY)
    );
}

// =====================
// TICKET BUTTONS
// =====================

/**
 * Create ticket action buttons
 */
function ticketButtons(closeCustomId = 'ticket-close', addCustomId = 'ticket-add', removeCustomId = 'ticket-remove') {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(addCustomId)
        .setLabel('➕ Add User')
        .setStyle(STYLES.SUCCESS),
      new ButtonBuilder()
        .setCustomId(removeCustomId)
        .setLabel('➖ Remove User')
        .setStyle(STYLES.DANGER),
      new ButtonBuilder()
        .setCustomId(closeCustomId)
        .setLabel('✖️ Close Ticket')
        .setStyle(STYLES.DANGER)
    );
}

/**
 * Create ticket category buttons
 */
function ticketCategoryButtons(categories) {
  return categories.map(cat => 
    new ButtonBuilder()
      .setCustomId(`ticket-create-${cat.value}`)
      .setLabel(cat.label)
      .setStyle(STYLES.PRIMARY)
      .setEmoji(cat.emoji)
  );
}

// =====================
// SUGGESTION BUTTONS
// =====================

/**
 * Create upvote/downvote buttons
 */
function voteButtons(customId = 'suggestion') {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}-upvote`)
        .setLabel('👍 Upvote')
        .setStyle(STYLES.SUCCESS),
      new ButtonBuilder()
        .setCustomId(`${customId}-downvote`)
        .setLabel('👎 Downvote')
        .setStyle(STYLES.DANGER)
    );
}

// =====================
// ECONOMY BUTTONS
// =====================

/**
 * Create economy action buttons
 */
function economyButtons() {
  return [
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('economy-daily')
          .setLabel('📅 Daily')
          .setStyle(STYLES.SUCCESS),
        new ButtonBuilder()
          .setCustomId('economy-weekly')
          .setLabel('📆 Weekly')
          .setStyle(STYLES.SUCCESS),
        new ButtonBuilder()
          .setCustomId('economy-work')
          .setLabel('💼 Work')
          .setStyle(STYLES.PRIMARY)
      ),
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('economy-gamble')
          .setLabel('🎰 Gamble')
          .setStyle(STYLES.DANGER),
        new ButtonBuilder()
          .setCustomId('economy-shop')
          .setLabel('🏪 Shop')
          .setStyle(STYLES.SECONDARY),
        new ButtonBuilder()
          .setCustomId('economy-balance')
          .setLabel('💰 Balance')
          .setStyle(STYLES.SECONDARY)
      )
  ];
}

// =====================
// SELECT MENUS
// =====================

/**
 * Create a string select menu
 */
function stringSelectMenu(options) {
  const {
    customId,
    placeholder = 'Select an option',
    options: menuOptions,
    minValues = 1,
    maxValues = 1,
    disabled = false
  } = options;
  
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);
  
  for (const opt of menuOptions) {
    menu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(opt.label)
        .setValue(opt.value)
        .setDescription(opt.description)
        .setEmoji(opt.emoji)
    );
  }
  
  return menu;
}

/**
 * Create a role select menu
 */
function roleSelectMenu(customId, placeholder = 'Select a role') {
  return new RoleSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);
}

/**
 * Create a channel select menu
 */
function channelSelectMenu(customId, placeholder = 'Select a channel') {
  return new ChannelSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);
}

/**
 * Create a user select menu
 */
function userSelectMenu(customId, placeholder = 'Select a user') {
  return new UserSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);
}

/**
 * Create a duration select menu for mute
 */
function durationSelectMenu(customId = 'mute-duration') {
  return stringSelectMenu({
    customId,
    placeholder: 'Select duration',
    options: [
      { label: '5 minutes', value: '5m', description: 'Short mute', emoji: '⏱️' },
      { label: '15 minutes', value: '15m', description: 'Quick mute', emoji: '⏱️' },
      { label: '30 minutes', value: '30m', description: 'Medium mute', emoji: '⏱️' },
      { label: '1 hour', value: '1h', description: 'One hour', emoji: '⏰' },
      { label: '6 hours', value: '6h', description: 'Half day', emoji: '⏰' },
      { label: '12 hours', value: '12h', description: 'Half day', emoji: '⏰' },
      { label: '1 day', value: '1d', description: 'Full day', emoji: '📅' },
      { label: '7 days', value: '7d', description: 'One week', emoji: '📅' },
      { label: '30 days', value: '30d', description: 'One month', emoji: '📅' }
    ]
  });
}

/**
 * Create a reason select menu for ban
 */
function reasonSelectMenu(customId = 'ban-reason') {
  return stringSelectMenu({
    customId,
    placeholder: 'Select reason',
    options: [
      { label: 'Breaking rules', value: 'Breaking server rules', description: 'General rule violation', emoji: '⚠️' },
      { label: 'Spam', value: 'Spam', description: 'Spamming messages', emoji: '📢' },
      { label: 'Harassment', value: 'Harassment', description: 'Harassing others', emoji: '😠' },
      { label: 'Hate speech', value: 'Hate speech', description: 'Hate speech', emoji: '🚫' },
      { label: 'Raiding', value: 'Raiding', description: 'Raiding the server', emoji: '💣' },
      { label: 'Impersonation', value: 'Impersonation', description: 'Impersonating others', emoji: '🎭' },
      { label: 'NSFW content', value: 'NSFW content', description: 'NSFW content', emoji: '🔞' },
      { label: 'Adverts', value: 'Advertising', description: 'Self-advertising', emoji: '📢' },
      { label: 'Other', value: 'Other', description: 'Other reason', emoji: '❓' }
    ]
  });
}

// =====================
// MODALS
// =====================

/**
 * Create a modal
 */
function createModal(options) {
  const {
    customId,
    title,
    components
  } = options;
  
  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title)
    .addComponents(components);
}

/**
 * Create a text input
 */
function textInput(options) {
  const {
    customId,
    label,
    style = TextInputStyle.Short,
    placeholder = null,
    required = true,
    minLength = null,
    maxLength = null,
    value = null
  } = options;
  
  const input = new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style);
  
  if (placeholder) input.setPlaceholder(placeholder);
  if (required) input.setRequired(required);
  if (minLength) input.setMinLength(minLength);
  if (maxLength) input.setMaxLength(maxLength);
  if (value) input.setValue(value);
  
  return input;
}

/**
 * Create a reason modal
 */
function reasonModal(customId = 'reason-modal') {
  return createModal({
    customId,
    title: 'Enter Reason',
    components: [
      new ActionRowBuilder().addComponents(
        textInput({
          customId: 'reason',
          label: 'Reason',
          style: TextInputStyle.Paragraph,
          placeholder: 'Enter the reason for this action...',
          required: true,
          minLength: 1,
          maxLength: 1000
        })
      )
    ]
  });
}

/**
 * Create a report modal
 */
function reportModal(customId = 'report-modal') {
  return createModal({
    customId,
    title: 'Submit Report',
    components: [
      new ActionRowBuilder().addComponents(
        textInput({
          customId: 'report-type',
          label: 'Report Type',
          style: TextInputStyle.Short,
          placeholder: 'User, Message, or Server',
          required: true
        })
      ),
      new ActionRowBuilder().addComponents(
        textInput({
          customId: 'report-details',
          label: 'Details',
          style: TextInputStyle.Paragraph,
          placeholder: 'Describe the issue in detail...',
          required: true,
          minLength: 10,
          maxLength: 2000
        })
      )
    ]
  });
}

/**
 * Create a suggestion modal
 */
function suggestionModal(customId = 'suggestion-modal') {
  return createModal({
    customId,
    title: 'Make a Suggestion',
    components: [
      new ActionRowBuilder().addComponents(
        textInput({
          customId: 'suggestion',
          label: 'Your Suggestion',
          style: TextInputStyle.Paragraph,
          placeholder: 'Share your idea...',
          required: true,
          minLength: 10,
          maxLength: 2000
        })
      )
    ]
  });
}

// =====================
// GIVEAWAY COMPONENTS
// =====================

/**
 * Create giveaway duration buttons
 */
function giveawayDurationButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway-5m')
        .setLabel('5m')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-15m')
        .setLabel('15m')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-30m')
        .setLabel('30m')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-1h')
        .setLabel('1h')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-6h')
        .setLabel('6h')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-1d')
        .setLabel('1d')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-7d')
        .setLabel('7d')
        .setStyle(STYLES.PRIMARY)
    );
}

/**
 * Create giveaway winner count buttons
 */
function giveawayWinnerButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway-winners-1')
        .setLabel('1')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-winners-2')
        .setLabel('2')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-winners-3')
        .setLabel('3')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-winners-5')
        .setLabel('5')
        .setStyle(STYLES.SECONDARY),
      new ButtonBuilder()
        .setCustomId('giveaway-winners-10')
        .setLabel('10')
        .setStyle(STYLES.SECONDARY)
    );
}

module.exports = {
  STYLES,
  // Basic buttons
  successButton,
  dangerButton,
  primaryButton,
  secondaryButton,
  linkButton,
  // Navigation
  prevButton,
  nextButton,
  closeButton,
  confirmButton,
  cancelButton,
  paginationRow,
  // Categories
  categoryButtons,
  moderationButtons,
  // Music
  musicControls,
  // Tickets
  ticketButtons,
  ticketCategoryButtons,
  // Votes
  voteButtons,
  // Economy
  economyButtons,
  // Select menus
  stringSelectMenu,
  roleSelectMenu,
  channelSelectMenu,
  userSelectMenu,
  durationSelectMenu,
  reasonSelectMenu,
  // Modals
  createModal,
  textInput,
  reasonModal,
  reportModal,
  suggestionModal,
  // Giveaway
  giveawayDurationButtons,
  giveawayWinnerButtons
};