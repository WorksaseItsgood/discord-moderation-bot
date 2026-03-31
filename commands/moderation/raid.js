const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Raid command - manage raid mode
module.exports = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Manage raid protection mode')
    .addSubcommand(subcommand =>
      subcommand.setName('enable')
        .setDescription('Enable raid lock mode')
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for enabling raid mode')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand.setName('disable')
        .setDescription('Disable raid lock mode'))
    .addSubcommand(subcommand =>
      subcommand.setName('status')
        .setDescription('Show raid mode status'))
    .addSubcommand(subcommand =>
      subcommand.setName('history')
        .setDescription('Show raid history')),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'enable':
        await handleEnableRaid(interaction, client);
        break;
      case 'disable':
        await handleDisableRaid(interaction, client);
        break;
      case 'status':
        await handleRaidStatus(interaction, client);
        break;
      case 'history':
        await handleRaidHistory(interaction, client);
        break;
    }
  }
};

async function handleEnableRaid(interaction, client) {
  const reason = interaction.options.getString('reason') || 'Manual raid lock';
  const guild = interaction.guild;
  
  // Set raid mode
  if (client.raidMode) {
    client.raidMode.set(guild.id, {
      active: true,
      timestamp: Date.now(),
      triggeredBy: interaction.user.tag,
      reason
    });
  }
  
  // Lock all channels
  const channels = guild.channels.cache.filter(ch => 
    ch.type === 0 || ch.type === 2 || ch.type === 15
  );
  
  let lockedCount = 0;
  for (const [channelId, channel] of channels) {
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false
      }, `Raid lock by ${interaction.user.tag}`);
      lockedCount++;
    } catch (error) {
      console.log(`[Raid] Error locking channel: ${error.message}`);
    }
  }
  
  // Add to history
  if (!client.raidHistory) client.raidHistory = new Map();
  const history = client.raidHistory.get(guild.id) || [];
  history.unshift({
    type: 'manual_lock',
    timestamp: Date.now(),
    triggeredBy: interaction.user.tag,
    reason,
    channelsLocked: lockedCount
  });
  client.raidHistory.set(guild.id, history.slice(0, 50));
  
  const embed = new EmbedBuilder()
    .setTitle('🚨 Raid Mode Enabled')
    .setColor(0xff0000)
    .addFields(
      { name: 'Enabled by', value: interaction.user.tag, inline: true },
      { name: 'Reason', value: reason, inline: true },
      { name: 'Channels Locked', value: String(lockedCount), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
  
  // Log to mod log
  const modLog = guild.channels.cache.find(
    ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
  );
  if (modLog) {
    await modLog.send({ embeds: [embed] });
  }
}

async function handleDisableRaid(interaction, client) {
  const guild = interaction.guild;
  
  // Disable raid mode
  if (client.raidMode) {
    client.raidMode.set(guild.id, {
      active: false,
      timestamp: Date.now(),
      triggeredBy: interaction.user.tag
    });
  }
  
  // Unlock all channels
  let unlockedCount = 0;
  if (client.lockedChannels) {
    for (const [channelId] of client.lockedChannels) {
      try {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          await channel.permissionOverwrites.delete(guild.roles.everyone, 'Raid lock lifted');
          unlockedCount++;
        }
      } catch (error) {
        console.log(`[Raid] Error unlocking channel: ${error.message}`);
      }
    }
    client.lockedChannels.clear();
  }
  
  // Add to history
  if (!client.raidHistory) client.raidHistory = new Map();
  const history = client.raidHistory.get(guild.id) || [];
  history.unshift({
    type: 'manual_unlock',
    timestamp: Date.now(),
    triggeredBy: interaction.user.tag,
    channelsUnlocked: unlockedCount
  });
  client.raidHistory.set(guild.id, history.slice(0, 50));
  
  const embed = new EmbedBuilder()
    .setTitle('✅ Raid Mode Disabled')
    .setColor(0x00ff00)
    .addFields(
      { name: 'Disabled by', value: interaction.user.tag, inline: true },
      { name: 'Channels Unlocked', value: String(unlockedCount), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
  
  // Log to mod log
  const modLog = guild.channels.cache.find(
    ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
  );
  if (modLog) {
    await modLog.send({ embeds: [embed] });
  }
}

async function handleRaidStatus(interaction, client) {
  const guild = interaction.guild;
  const raidMode = client.raidMode?.get(guild.id);
  
  const embed = new EmbedBuilder()
    .setTitle('🛡️ Raid Mode Status')
    .setColor(raidMode?.active ? 0xff0000 : 0x00ff00)
    .addFields(
      { name: 'Status', value: raidMode?.active ? '🔒 LOCKED' : '✅ Open', inline: true }
    );
  
  if (raidMode?.active) {
    embed.addFields(
      { name: 'Enabled', value: `<t:${Math.floor(raidMode.timestamp / 1000)}:f>`, inline: true },
      { name: 'By', value: raidMode.triggeredBy, inline: true }
    );
    
    if (raidMode.reason) {
      embed.addFields({ name: 'Reason', value: raidMode.reason });
    }
  }
  
  await interaction.reply({ embeds: [embed] });
}

async function handleRaidHistory(interaction, client) {
  const guild = interaction.guild;
  const history = client.raidHistory?.get(guild.id) || [];
  
  if (history.length === 0) {
    return interaction.reply({ content: '📋 No raid history found.', ephemeral: true });
  }
  
  const embed = new EmbedBuilder()
    .setTitle('📋 Raid History')
    .setColor(0x0099ff)
    .setDescription(`Last ${Math.min(history.length, 10)} events`);
  
  for (const entry of history.slice(0, 10)) {
    const type = entry.type === 'manual_lock' ? '🔒 Lock' : 
                entry.type === 'manual_unlock' ? '🔓 Unlock' :
                entry.type === 'auto_lock' ? '🚨 Auto Lock' : 'Event';
    
    embed.addFields({
      name: type,
      value: `By: ${entry.triggeredBy || 'System'}\nTime: <t:${Math.floor(entry.timestamp / 1000)}:f>${entry.reason ? `\nReason: ${entry.reason}` : ''}`
    });
  }
  
  await interaction.reply({ embeds: [embed] });
}