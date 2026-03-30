const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { defaultConfig } = require('../config');

// Suggest command - create a suggestion
module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create a suggestion for the server')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Your suggestion')
        .setRequired(true)),
  permissions: [],
  async execute(interaction, client) {
    const content = interaction.options.getString('suggestion');
    const guild = interaction.guild;
    const user = interaction.user;
    const db = require('../database');
    
    // Create suggestion embed in a suggestions channel
    const channel = guild.channels.cache.find(ch => ch.name === 'suggestions');
    
    const suggestionEmbed = new EmbedBuilder()
      .setTitle('💡 New Suggestion')
      .setColor(0x00ff00)
      .setDescription(content)
      .addFields(
        { name: 'Submitted by', value: user.toString(), inline: true }
      )
      .setFooter({ text: '👍 Vote yes | 👎 Vote no' })
      .setTimestamp();
    
    const rowUp = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`suggest-up-${user.id}`)
          .setLabel('👍')
          .setStyle(ButtonStyle.Success)
      );
    const rowDown = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`suggest-down-${user.id}`)
          .setLabel('👎')
          .setStyle(ButtonStyle.Danger)
      );
    
    if (channel) {
      const message = await channel.send({ embeds: [suggestionEmbed], components: [rowUp, rowDown] });
      
      db.createSuggestion(guild.id, message.id, user.id, content);
      
      await interaction.reply({
        content: `✅ Your suggestion has been posted to ${channel}!`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '💡 Your suggestion:',
        embeds: [suggestionEmbed],
        ephemeral: true
      });
    }
  }
};