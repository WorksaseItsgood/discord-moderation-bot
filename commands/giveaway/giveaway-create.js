/**
 * Giveaway Create Command - Create a giveaway
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-create')
    .setDescription('Create a giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize to giveaway')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners (default: 1)')
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1d, 1h, 30m)')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Required role (optional)')
    )
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Required level (optional)')
    ),
  
  async execute(interaction, client) {
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners') || 1;
    const duration = interaction.options.getString('duration');
    const requiredRole = interaction.options.getRole('role');
    const requiredLevel = interaction.options.getInteger('level');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need ManageGuild permission!', ephemeral: true });
    }
    
    // Parse duration
    const durationMs = parseDuration(duration);
    
    if (!durationMs) {
      return interaction.reply({ content: 'Invalid duration! Use format like: 1d, 1h, 30m', ephemeral: true });
    }
    
    const endsAt = Date.now() + durationMs;
    
    // Create giveaway embed
    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY')
      .setColor(0xffd700)
      .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}`)
      .addFields(
        { name: '⏰ Ends', value: `<t:${Math.floor(endsAt / 1000)}:R>`, inline: true },
        { name: '🎯 Entries', value: '0', inline: true }
      )
      .setFooter({ text: 'React with 🎉 to enter!' })
      .setTimestamp();
    
    if (requiredRole) {
      embed.addFields({ name: '📋 Required Role', value: requiredRole.toString() });
    }
    
    if (requiredLevel) {
      embed.addFields({ name: '📊 Required Level', value: `Level ${requiredLevel}` });
    }
    
    // Send giveaway message
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    
    // Add reaction
    await message.react('🎉');
    
    // Save to database
    client.dbManager.createGiveaway(message.id, guildId, prize, Math.floor(endsAt / 1000), {
      count: winners,
      requiredRole: requiredRole?.id,
      requiredLevel: requiredLevel || 1
    });
    
    // Schedule end time
    setTimeout(async () => {
      await endGiveaway(client, interaction.guild, message.id);
    }, durationMs);
    
    await interaction.followUp({ content: 'Giveaway created!', ephemeral: true });
  }
};

// Helper to parse duration string
function parseDuration(str) {
  if (!str) return null;
  
  const match = str.match(/^(\d+)([dhms])$/i);
  
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return null;
  }
}

// End giveaway helper
async function endGiveaway(client, guild, messageId) {
  const guildId = guild.id;
  const giveaway = client.dbManager.getGiveaway(messageId, guildId);
  
  if (!giveaway) return;
  
  const channel = guild.channels.cache.find(ch => 
    ch.messages && ch.messages.cache.has(messageId)
  );
  
  if (!channel) return;
  
  const message = await channel.messages.fetch(messageId).catch(() => null);
  
  if (!message) return;
  
  // Get users who reacted
  const reaction = message.reactions.cache.get('🎉');
  
  if (!reaction) {
    const failEmbed = new EmbedBuilder()
      .setTitle('❌ Giveaway Ended')
      .setDescription('No winners!')
      .setColor(0xff0000);
    
    await message.edit({ embeds: [failEmbed], components: [] });
    return;
  }
  
  const users = await reaction.users.fetch();
  users.delete(client.user.id); // Remove bot
  
  const entries = Array.from(users.values());
  
  if (entries.length === 0) {
    const failEmbed = new EmbedBuilder()
      .setTitle('❌ Giveaway Ended')
      .setDescription('No winners!')
      .setColor(0xff0000);
    
    await message.edit({ embeds: [failEmbed], components: [] });
    return;
  }
  
  // Select winners randomly
  const winners = [];
  const winnerCount = Math.min(giveaway.count, entries.length);
  
  for (let i = 0; i < winnerCount; i++) {
    const index = Math.floor(Math.random() * entries.length);
    winners.push(entries[index]);
    entries.splice(index, 1);
  }
  
  // Update database
  client.dbManager.endGiveaway(messageId, guildId, winners.map(w => w.id));
  
  // Announce winners
  const winnerText = winners.map(w => w.toString()).join(', ');
  
  const endEmbed = new EmbedBuilder()
    .setTitle('🎉 GIVEAWAY ENDED')
    .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnerText}`)
    .setColor(0xffd700)
    .setFooter({ text: 'Congratulations!' })
    .setTimestamp();
  
  await message.edit({ embeds: [endEmbed], components: [] });
  
  // DM winners
  for (const winner of winners) {
    try {
      await winner.send({
        content: `🎉 Congratulations! You won the **${giveaway.prize}** giveaway in ${guild.name}!`
      });
    } catch (e) {
      // Can't DM
    }
  }
}