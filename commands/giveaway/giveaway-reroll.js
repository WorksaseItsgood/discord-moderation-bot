/**
 * Giveaway Reroll Command - Reroll a giveaway
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { endGiveaway } = require('./giveaway-create');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Reroll a giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Giveaway message ID')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need ManageGuild permission!', ephemeral: true });
    }
    
    // Get giveaway
    const giveaway = client.dbManager.getGiveaway(messageId, guildId);
    
    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found!', ephemeral: true });
    }
    
    // Find the message
    const channel = interaction.guild.channels.cache.find(ch => 
      ch.messages && ch.messages.cache.has(messageId)
    );
    
    if (!channel) {
      return interaction.reply({ content: 'Channel not found!', ephemeral: true });
    }
    
    const message = await channel.messages.fetch(messageId).catch(() => null);
    
    if (!message) {
      return interaction.reply({ content: 'Message not found!', ephemeral: true });
    }
    
    // Get users who reacted
    const reaction = message.reactions.cache.get('🎉');
    
    if (!reaction) {
      return interaction.reply({ content: 'No entries to reroll!', ephemeral: true });
    }
    
    const users = await reaction.users.fetch();
    users.delete(client.user.id);
    
    const entries = Array.from(users.values());
    
    if (entries.length === 0) {
      return interaction.reply({ content: 'No entries to reroll!', ephemeral: true });
    }
    
    // Select new winner
    const newWinner = entries[Math.floor(Math.random() * entries.length)];
    
    // Update database
    client.dbManager.endGiveaway(messageId, guildId, [newWinner.id]);
    
    // Announce new winner
    const embed = new EmbedBuilder()
      .setTitle('🔄 GIVEAWAY REROLLED')
      .setDescription(`**New Winner:** ${newWinner.toString()}\n**Prize:** ${giveaway.prize}`)
      .setColor(0x00ff00)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    
    // DM new winner
    try {
      await newWinner.send({
        content: `🎉 Congratulations! You won the **${giveaway.prize}** giveaway in ${interaction.guild.name}!`
      });
    } catch (e) {
      // Can't DM
    }
  }
};