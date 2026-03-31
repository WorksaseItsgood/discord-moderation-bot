const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Marry command - Marriage system
module.exports = {
  data: new SlashCommandBuilder()
    .setName('marry')
    .setDescription('Propose to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to propose to')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot propose to yourself!', ephemeral: true });
    }
    
    // Initialize marriages
    if (!client.marriages) client.marriages = new Map();
    if (!client.proposals) client.proposals = new Map();
    
    const userMarriages = client.marriages.get(interaction.user.id);
    if (userMarriages && userMarriages.partner) {
      return interaction.reply({ content: '❌ You are already married!', ephemeral: true });
    }
    
    const partnerMarriages = client.marriages.get(user.id);
    if (partnerMarriages && partnerMarriages.partner) {
      return interaction.reply({ content: '❌ That user is already married!', ephemeral: true });
    }
    
    // Send proposal
    const embed = new EmbedBuilder()
      .setTitle('💍 Marriage Proposal')
      .setColor(0xff69b4)
      .setDescription(`${interaction.user} wants to marry you ${user}!`)
      .addFields(
        { name: 'Accept', value: 'Click ✅ to accept', inline: true },
        { name: 'Decline', value: 'Click ❌ to decline', inline: true }
      );
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('✅');
    await message.react('❌');
    
    // Store proposal
    client.proposals.set(message.id, {
      proposer: interaction.user.id,
      proposee: user.id,
      timestamp: Date.now()
    });
    
    // Wait for response
    const filter = (reaction, reactor) => ['✅', '❌'].includes(reaction.emoji.name) && reactor.id === user.id;
    
    const collector = message.createReactionCollector({ filter, time: 60000 });
    
    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '✅') {
        // Accept
        client.marriages.set(interaction.user.id, { partner: user.id, timestamp: Date.now() });
        client.marriages.set(user.id, { partner: interaction.user.id, timestamp: Date.now() });
        
        const acceptEmbed = new EmbedBuilder()
          .setTitle('💍 Marriage Accepted!')
          .setColor(0xff69b4)
          .setDescription(`${interaction.user} and ${user} are now married! 💕`);
        
        await message.edit({ embeds: [acceptEmbed] });
      } else {
        // Decline
        const declineEmbed = new EmbedBuilder()
          .setTitle('💔 Proposal Declined')
          .setColor(0xff0000)
          .setDescription(`${user} declined the proposal.`);
        
        await message.edit({ embeds: [declineEmbed] });
      }
      
      client.proposals.delete(message.id);
      collector.stop();
    });
  }
};