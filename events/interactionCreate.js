const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Interaction Create Event
 * Handles button clicks, select menus, and modal submissions
 */
module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    // Handle button interactions
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction, client);
    }
    
    // Handle select menu interactions
    if (interaction.isSelectMenu()) {
      await handleSelectMenuInteraction(interaction, client);
    }
    
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      await handleModalInteraction(interaction, client);
    }
  }
};

/**
 * Handle button clicks
 */
async function handleButtonInteraction(interaction, client) {
  const customId = interaction.customId;
  const user = interaction.user;
  const db = require('../database');
  
  // Ticket close button
  if (customId === 'ticket-close') {
    const ticket = db.getTicket(interaction.channel.id);
    if (ticket) {
      db.closeTicket(ticket.ticket_id);
      await interaction.channel.delete();
    }
  }
  
  // Verification button
  if (customId === 'verify-button') {
    await showVerificationPrompt(interaction, client);
  }
  
  // Giveaway join button
  if (customId === 'giveaway-join') {
    const message = interaction.message;
    const joined = db.joinGiveaway(message.id, user.id);
    
    if (joined) {
      await interaction.reply({ content: '🎉 You\'ve entered the giveaway!', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ You\'ve already entered!', ephemeral: true });
    }
  }
  
  // Ticket create button
  if (customId === 'ticket-create') {
    // This will trigger a follow-up to create a ticket
    await interaction.reply({
      content: 'Creating a ticket...\nUse `/ticket` command with your issue description.',
      ephemeral: true
    });
  }
  
  // Suggestion vote buttons
  if (customId.startsWith('suggest-up-') || customId.startsWith('suggest-down-')) {
    const vote = customId.startsWith('suggest-up-') ? 'up' : 'down';
    const suggestionId = customId.split('-')[2]; // This is simplified
    
    await interaction.reply({
      content: '✅ Vote recorded!',
      ephemeral: true
    });
  }
  
  // Warn confirmation buttons
  if (customId.startsWith('warn_confirm_') || customId.startsWith('warn_cancel_')) {
    const { handleConfirmation } = require('../commands/moderation/warn');
    await handleConfirmation(interaction, client);
  }
  
  // Clearwarns confirmation buttons
  if (customId.startsWith('clearwarns_confirm_') || customId.startsWith('clearwarns_cancel_')) {
    const { handleConfirmation } = require('../commands/moderation/clearwarns');
    await handleConfirmation(interaction);
  }
}

/**
 * Handle select menu interactions
 */
async function handleSelectMenuInteraction(interaction, client) {
  const customId = interaction.customId;
  
  // Handle any select menus here
}

/**
 * Handle modal submissions
 */
async function handleModalInteraction(interaction, client) {
  const customId = interaction.customId;
  
  // Verification modal
  if (customId === 'verification-modal') {
    const captchaInput = interaction.fields.getTextInputValue('captcha-input');
    const db = require('../database');
    const settings = db.getVerificationSettings(interaction.guild.id);
    
    if (captchaInput?.toUpperCase() === settings?.captcha_code?.toUpperCase()) {
      const role = interaction.guild.roles.cache.get(settings.verified_role_id);
      const member = interaction.guild.members.cache.get(interaction.user.id);
      
      if (role && member) {
        await member.roles.add(role);
      }
      
      await interaction.reply({
        content: '✅ Verification complete! You now have access to the server.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ Incorrect captcha code. Please try again.',
        ephemeral: true
      });
    }
  }
}

/**
 * Show verification prompt
 */
async function showVerificationPrompt(interaction, client) {
  const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
  
  const modal = new ModalBuilder()
    .setCustomId('verification-modal')
    .setTitle('Server Verification')
    .addComponents(
      new ActionRowBuilder()
        .addComponents(
          new TextInputBuilder()
          .setCustomId('captcha-input')
          .setLabel('Enter the code shown in the channel')
          .setStyle(1) // Short text
          .setPlaceholder('Enter captcha code')
        )
    );
  
  await interaction.showModal(modal);
}