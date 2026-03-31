const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Appeal command - user appeals a punishment
module.exports = {
  data: new SlashCommandBuilder()
    .setName('appeal')
    .setDescription('Appeal a punishment')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for appealing')
        .setRequired(true)),
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason');
    const user = interaction.user;
    const guild = interaction.guild;
    
    // Create appeal embed
    const appealEmbed = new EmbedBuilder()
      .setTitle('📨 Punishment Appeal')
      .setColor(0x0099ff)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Tag', value: user.tag, inline: true },
        { name: 'Appeal Reason', value: reason }
      )
      .setTimestamp();
    
    // Find modmail or appeals channel
    const appealChannel = guild.channels.cache.find(ch => 
      ch.name === 'appeals' || ch.name === 'modmail' || ch.name === 'support' || ch.name === 'appeal'
    );
    
    if (appealChannel) {
      // Send to appeals channel
      const msg = await appealChannel.send({ embeds: [appealEmbed] });
      
      // Add approve/decline buttons
      const row = {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: '✅ Approve',
            custom_id: `appeal_approve_${user.id}`
          },
          {
            type: 2,
            style: 4,
            label: '❌ Decline',
            custom_id: `appeal_decline_${user.id}`
          }
        ]
      };
      
      await appealChannel.send({ components: [row] });
    }
    
    // Also try to DM the user confirmation
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Appeal Submitted')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Your appeal has been submitted', value: 'Moderators will review it soon.' },
        { name: 'Reason', value: reason }
      );
    
    try {
      await user.send({ embeds: [confirmEmbed] });
    } catch (e) {
      // Can't DM, that's okay
    }
    
    await interaction.reply({ 
      content: '✅ Your appeal has been submitted! A moderator will review it.',
      ephemeral: true 
    });
  }
};