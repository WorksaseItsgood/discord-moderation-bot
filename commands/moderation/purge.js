const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Purge command - delete multiple messages
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
        .setTitle('🗑️ Messages Purged')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Deleted', value: String(toDelete.size), inline: true },
          { name: 'Channel', value: interaction.channel.toString(), inline: true },
          { name: 'Reason', value: reason, inline: true }
        );
      
      //ephemeral reply to hide from others
      await interaction.reply({ embeds: [embed], ephemeral: true });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error purging messages: ${error.message}`,
        ephemeral: true
      });
    }
  }
};