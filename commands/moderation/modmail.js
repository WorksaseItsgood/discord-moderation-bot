const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Modmail command - send message to mod mail
module.exports = {
  data: new SlashCommandBuilder()
    .setName('modmail')
    .setDescription('Send a message to mod mail')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('attachment')
        .setDescription('Optional attachment')
        .setRequired(false)),
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const attachment = interaction.options.getAttachment('attachment');
    const user = interaction.user;
    const guild = interaction.guild;
    
    // Find modmail channel
    const modmailChannel = guild.channels.cache.find(ch => 
      ch.name === 'modmail' || ch.name === 'mail' || ch.name === 'support' || ch.name === 'mod-mail'
    );
    
    if (!modmailChannel) {
      return interaction.reply({ 
        content: '❌ No modmail channel found.',
        ephemeral: true 
      });
    }
    
    // Create modmail embed
    const mailEmbed = new EmbedBuilder()
      .setTitle('📬 New Modmail')
      .setColor(0x0099ff)
      .addFields(
        { name: 'From', value: `${user} (${user.id})`, inline: true },
        { name: 'Message', value: message }
      )
      .setTimestamp();
    
    // Send to modmail channel
    if (attachment) {
      mailEmbed.setImage(attachment.url);
    }
    
    await modmailChannel.send({ embeds: [mailEmbed] });
    
    if (attachment) {
      await modmailChannel.send({ files: [attachment] });
    }
    
    await interaction.reply({ 
      content: '✅ Your message has been sent to the moderators!',
      ephemeral: true 
    });
  }
};