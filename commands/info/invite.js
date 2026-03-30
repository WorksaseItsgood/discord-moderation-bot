const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Invite command - get bot invite or create server invite
module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get invite links')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of invite')
        .setRequired(false)
        .addChoices(
          { name: 'Bot Invite', value: 'bot' },
          { name: 'Server Invite', value: 'server' }
        )),
  permissions: [],
  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'bot';
    
    if (type === 'bot') {
      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Invite')
        .setColor(0x00ff00)
        .setDescription('Add the bot to your server!')
        .addFields(
          { name: 'Invite Link', value: '[Click here to invite](https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)' }
        );
      
      await interaction.reply({ embeds: [embed] });
    } else {
      // Create a temporary invite for the current channel
      const channel = interaction.channel;
      
      try {
        const invite = await channel.createInvite({
          maxAge: 86400, // 24 hours
          maxUses: 100,
          unique: true
        });
        
        const embed = new EmbedBuilder()
          .setTitle('🔗 Server Invite')
          .setColor(0x00ff00)
          .addFields(
            { name: 'Invite', value: invite.url, inline: true },
            { name: 'Expires in', value: '24 hours', inline: true },
            { name: 'Max uses', value: '100', inline: true }
          );
        
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: '❌ I cannot create invites in this channel!', ephemeral: true });
      }
    }
  }
};