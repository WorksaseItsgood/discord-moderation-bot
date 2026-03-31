/**
 * Poll Command - Create interactive polls with buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { poll, info, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create an interactive poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Poll question')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Poll options (separated by commas)')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('multiple')
        .setDescription('Allow multiple votes')
        .setRequired(false)
        .setDefaultValue(false)),
  
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options');
    const multiple = interaction.options.getBoolean('multiple') || false;
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // If no question, show the modal interface
    if (!question) {
      const modal = new ModalBuilder()
        .setCustomId('poll-modal')
        .setTitle('Create a Poll')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('poll-question')
              .setLabel('Question')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('What do you want to ask?')
              .setRequired(true)
              .setMinLength(5)
              .setMaxLength(500)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('poll-options')
              .setLabel('Options (comma separated)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Yes, No, Maybe')
              .setRequired(true)
              .setMinLength(2)
              .setMaxLength(500)
          )
        );
      
      await interaction.showModal(modal);
      return;
    }
    
    // Process the poll
    await createPoll(interaction, client, question, options, multiple, botAvatar);
  }
};

/**
 * Create an interactive poll
 */
async function createPoll(interaction, client, question, optionsStr, multiple, botAvatar) {
  const options = optionsStr ? optionsStr.split(',').map(o => o.trim()) : ['Yes', 'No'];
  
  if (options.length < 2) {
    const errorEmbed = info('❌ Invalid Options', 'Please provide at least 2 options!', { thumbnail: botAvatar });
    return interaction.reply({ embeds: [errorEmbed] });
  }
  
  if (options.length > 10) {
    const errorEmbed = info('❌ Too Many Options', 'Maximum 10 options allowed!', { thumbnail: botAvatar });
    return interaction.reply({ embeds: [errorEmbed] });
  }
  
  // Initialize poll storage
  if (!client.polls) {
    client.polls = new Map();
  }
  
  const pollId = Math.random().toString(36).substr(2, 8);
  const pollData = {
    id: pollId,
    question,
    options,
    votes: Array(options.length).fill(0),
    voters: new Map(),
    multiple,
    createdAt: Date.now(),
    creatorId: interaction.user.id
  };
  
  client.polls.set(pollId, pollData);
  
  // Create poll embed
  const embed = new EmbedBuilder()
    .setColor(COLORS.secondary)
    .setAuthor({
      name: '📊 Poll',
      iconURL: botAvatar
    })
    .setTitle(question)
    .setDescription(options.map((opt, i) => 
      `\`${i + 1}\` **${opt}**`
    ).join('\n\n') + '\n\n*Vote by clicking the buttons below!*')
    .setFooter({
      text: `CrowBot • ${multiple ? 'Multiple choice' : 'Single choice'} • ${options.length} options`,
      iconURL: botAvatar
    })
    .setTimestamp();
  
  // Create vote buttons (one for each option)
  const buttonRow = new ActionRowBuilder();
  for (let i = 0; i < Math.min(options.length, 5); i++) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`poll-vote-${pollId}-${i}`)
        .setLabel(options[i])
        .setStyle(ButtonStyle.Primary)
    );
  };
  
  // Add second row if more options
  let buttonRow2 = null;
  if (options.length > 5) {
    buttonRow2 = new ActionRowBuilder();
    for (let i = 5; i < options.length; i++) {
      buttonRow2.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll-vote-${pollId}-${i}`)
          .setLabel(options[i])
          .setStyle(ButtonStyle.Primary)
      );
    }
  }
  
  // Add end poll button for creator
  const endRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`poll-end-${pollId}`)
        .setLabel('🏁 End Poll')
        .setStyle(ButtonStyle.Danger)
    );
  
  const components = buttonRow2 ? [buttonRow, buttonRow2, endRow] : [buttonRow, endRow];
  
  const reply = await interaction.reply({ embeds: [embed], components });
  
  // Store poll message
  pollData.messageId = reply.id;
  pollData.channelId = interaction.channel.id;
  
  // Create collector for votes
  const filter = i => i.customId.startsWith(`poll-vote-${pollId}`);
  const collector = reply.createMessageComponentCollector({ filter, time: 3600000 }); // 1 hour
  
  collector.on('collect', async (i) => {
    // Get poll data
    const poll = client.polls.get(pollId);
    if (!poll) {
      await i.reply({ content: 'Poll not found!', ephemeral: true });
      return;
    }
    
    const optionIndex = parseInt(i.customId.split('-').pop());
    const userId = i.user.id;
    
    // Handle vote
    if (poll.multiple) {
      // Multiple votes allowed
      const userVotes = poll.voters.get(userId) || [];
      const existingIndex = userVotes.indexOf(optionIndex);
      
      if (existingIndex > -1) {
        // Remove vote
        userVotes.splice(existingIndex, 1);
        poll.votes[optionIndex]--;
      } else {
        // Add vote
        userVotes.push(optionIndex);
        poll.votes[optionIndex]++;
      }
      poll.voters.set(userId, userVotes);
    } else {
      // Single vote only
      const userVotes = poll.voters.get(userId);
      if (userVotes !== undefined) {
        // Remove previous vote
        poll.votes[userVotes]--;
      }
      poll.votes[optionIndex]++;
      poll.voters.set(userId, optionIndex);
    }
    
    // Update poll embed
    const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
    
    const updatedEmbed = new EmbedBuilder()
      .setColor(COLORS.secondary)
      .setAuthor({
        name: '📊 Poll',
        iconURL: botAvatar
      })
      .setTitle(poll.question)
      .setDescription(poll.options.map((opt, i) => {
        const voteCount = poll.votes[i];
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        const bar = '█'.repeat(Math.ceil(percentage / 10)) + '░'.repeat(10 - Math.ceil(percentage / 10));
        return `\`${i + 1}\` **${opt}**\n\`${bar}\` ${percentage}% (${voteCount} votes)`;
      }).join('\n\n') + '\n\n📊 **Total Votes:** ' + totalVotes)
      .setFooter({
        text: `CrowBot • ${multiple ? 'Multiple choice' : 'Single choice'} • ${totalVotes} votes`,
        iconURL: botAvatar
      })
      .setTimestamp();
    
    await i.update({ embeds: [updatedEmbed] });
  });
}

module.exports.createPoll = createPoll;