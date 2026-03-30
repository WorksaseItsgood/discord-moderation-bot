const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Giveaway command - create a giveaway
module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Create', value: 'create' },
          { name: 'End', value: 'end' },
          { name: 'Reroll', value: 'reroll' }
        ))
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize to giveaway')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1d, 12h, 30m)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('Message ID to end/reroll')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const prize = interaction.options.getString('prize') || 'A mystery prize!';
    const winners = interaction.options.getInteger('winners') || 1;
    const duration = interaction.options.getString('duration') || '1d';
    const messageId = interaction.options.getString('messageid');
    const guild = interaction.guild;
    const db = require('../database');
    
    const durationMs = parseDuration(duration);
    const endsAt = Math.floor((Date.now() + durationMs) / 1000);
    
    switch (action) {
      case 'create':
        const channel = interaction.channel;
        
        const embed = new EmbedBuilder()
          .setTitle('🎁 Giveaway!')
          .setColor(0x00ff00)
          .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n\nClick the button below to enter!`)
          .addFields(
            { name: 'Ends', value: `${new Date(Date.now() + durationMs).toLocaleString()}`, inline: true },
            { name: 'Entries', value: '0', inline: true }
          )
          .setFooter({ text: '🎁 Good luck!' });
        
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('giveaway-join')
              .setLabel('🎁 Enter')
              .setStyle(ButtonStyle.Success)
          );
        
        const message = await channel.send({ embeds: [embed], components: [row] });
        
        db.createGiveaway(guild.id, message.id, prize, winners, endsAt);
        
        await interaction.reply({
          content: `✅ Giveaway created! ${message.url}`,
          ephemeral: true
        });
        break;
        
      case 'end':
        if (!messageId) {
          return interaction.reply({ content: '❌ Please provide a message ID!', ephemeral: true });
        }
        
        const winnersList = db.endGiveaway(messageId);
        
        if (!winnersList) {
          return interaction.reply({ content: '❌ Giveaway not found!', ephemeral: true });
        }
        
        const winnerMentions = winnersList.map(id => `<@${id}>`).join(', ');
        
        const endEmbed = new EmbedBuilder()
          .setTitle('🎉 Giveaway Ended!')
          .setColor(0xffd700)
          .setDescription(`**Prize:** ${prize}\n\n**Winners:** ${winnerMentions || 'No entries!'}`);
        
        await interaction.reply({ embeds: [endEmbed] });
        break;
        
      case 'reroll':
        if (!messageId) {
          return interaction.reply({ content: '❌ Please provide a message ID!', ephemeral: true });
        }
        
        const rerollWinners = db.endGiveaway(messageId);
        
        if (!rerollWinners || rerollWinners.length === 0) {
          return interaction.reply({ content: '❌ No entries to reroll from!', ephemeral: true });
        }
        
        const newWinner = rerollWinners[Math.floor(Math.random() * rerollWinners.length)];
        
        const rerollEmbed = new EmbedBuilder()
          .setTitle('🎉 New Winner!')
          .setColor(0xffd700)
          .setDescription(`The new winner is: <@${newWinner}>!`);
        
        await interaction.reply({ embeds: [rerollEmbed] });
        break;
    }
  }
};

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([dhms])$/i);
  if (!match) return 24 * 60 * 60 * 1000;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  
  return value * multipliers[unit];
}