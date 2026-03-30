/**
 * Poll Command - Create a poll
 */

const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Poll question')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Poll options (separated by semicolons)')
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes (default: 60)')
    ),
  
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const optionsString = interaction.options.getString('options');
    const duration = interaction.options.getInteger('duration') || 60;
    const guildId = interaction.guildId;
    
    // Parse options
    const options = optionsString ? optionsString.split(';').map(o => o.trim()).filter(o => o) : ['Yes', 'No'];
    
    if (options.length < 2) {
      return interaction.reply({ content: 'You need at least 2 options!', ephemeral: true });
    }
    
    if (options.length > 10) {
      return interaction.reply({ content: 'Maximum 10 options!', ephemeral: true });
    }
    
    // Create poll embed
    const embed = new EmbedBuilder()
      .setTitle(`📊 Poll: ${question}`)
      .setColor(0x0099ff)
      .setDescription('Vote by clicking a button below!')
      .setFooter({ text: `Poll ends in ${duration} minutes` })
      .setTimestamp(Date.now() + duration * 60 * 1000);
    
    // Add options to embed
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    
    options.forEach((option, index) => {
      embed.addFields({ name: emojis[index], value: option });
    });
    
    // Create buttons
    const row = new ActionRowBuilder();
    
    options.forEach((option, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll-${index}`)
          .setLabel(option.slice(0, 20))
          .setStyle(ButtonStyle.Primary)
      );
    });
    
    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    
    // Store poll data
    client.pollData = client.pollData || new Map();
    client.pollData.set(message.id, { options, votes: options.map(() => 0), voters: new Map() });
    
    // Auto-end poll after duration
    setTimeout(async () => {
      const poll = client.pollData.get(message.id);
      
      if (!poll) return;
      
      // Find winning option
      let maxVotes = 0;
      let winners = [];
      
      poll.votes.forEach((votes, index) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          winners = [index];
        } else if (votes === maxVotes) {
          winners.push(index);
        }
      });
      
      const winnerText = winners.map(i => poll.options[i]).join(', ');
      
      const endEmbed = new EmbedBuilder()
        .setTitle(`📊 Poll Ended: ${question}`)
        .setColor(0x00ff00)
        .setDescription(`**Winner:** ${winnerText}`)
        .addFields(
          ...poll.options.map((opt, i) => ({
            name: opt,
            value: `${poll.votes[i]} votes`,
            inline: true
          }))
        )
        .setFooter({ text: 'Poll ended' })
        .setTimestamp();
      
      await message.edit({ embeds: [endEmbed], components: [] });
      
      client.pollData.delete(message.id);
    }, duration * 60 * 1000);
  }
};