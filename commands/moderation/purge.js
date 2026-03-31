const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete multiple messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for purging')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Fetch messages
    const messages = await interaction.channel.messages.fetch({ limit: amount });
    
    // Filter by user if specified
    let filteredMessages = messages;
    if (user) {
      filteredMessages = messages.filter(m => m.author.id === user.id);
    }
    
    // Limit to 100
    const toDelete = filteredMessages.slice(0, 100);
    
    // Delete messages
    try {
      await interaction.channel.bulkDelete(toDelete, true);
      
      console.log(`[Purge] Deleted ${toDelete.size} messages in ${interaction.channel.name}`);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.ERROR)
        .setTitle('🗑️ Messages Purged')
        .setDescription(`Successfully deleted ${toDelete.size} message(s)`)
        .addFields(
          { name: 'Channel', value: interaction.channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
        .setTimestamp();
      
      if (user) {
        embed.addFields({ name: 'Filtered', value: `Only messages from ${user.tag}`, inline: false });
      }
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      const errEmbedResponse = errorEmbed('Purge Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};