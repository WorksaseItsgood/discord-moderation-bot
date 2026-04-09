/**
 * Dashboard Handler - Button-based configuration dashboard
 *
 * Provides a complete UI for configuring the bot without commands:
 * - Main dashboard with sections
 * - Anti-raid configuration
 * - Anti-spam configuration
 * - Derank thresholds
 * - Whitelist management
 * - Log channel settings
 * - And more...
 */

import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
} from 'discord.js';

export function createDashboardButtons(client) {
  // Initialize button handlers collection
  client.buttonHandlers = new Map();
  client.selectMenuHandlers = new Map();
  client.modalHandlers = new Map();

  // Register button handlers
  client.buttonHandlers.set('dashboard', handleDashboardButton);
  client.buttonHandlers.set('config', handleConfigButton);
  client.buttonHandlers.set('shield', handleShieldButton);
  client.buttonHandlers.set('raidmode', handleRaidModeButton);
  client.buttonHandlers.set('whitelist', handleWhitelistButton);
  client.buttonHandlers.set('antispam', handleAntiSpamButton);
  client.buttonHandlers.set('derank', handleDerankButton);
  client.buttonHandlers.set('logs', handleLogsButton);

  client.logger.info('[Dashboard] Button handlers registered');
}

// ====================== MAIN DASHBOARD ======================

export async function sendDashboard(interaction, client, section = 'main') {
  const embed = new EmbedBuilder().setTitle('🛠️ Niotic Dashboard');

  switch (section) {
    case 'main':
      embed
        .setColor(0x5865F2)
        .setDescription('**Niotic Moderation Bot v3.0**\nConfigure your server settings using the buttons below.')
        .addFields(
          { name: '🛡️ Protection', value: 'Anti-raid, anti-spam, derank settings', inline: false },
          { name: '⚙️ Configuration', value: 'General bot configuration', inline: false },
          { name: '📋 Whitelist', value: 'Manage whitelisted users/roles/channels', inline: false },
          { name: '📜 Logs', value: 'Configure log channels', inline: false },
          { name: '🔧 Tools', value: 'Utilities and extra features', inline: false }
        );
      break;

    case 'protection':
      embed
        .setColor(0xff0000)
        .setTitle('🛡️ Protection Settings')
        .setDescription('Configure protection systems');
      break;

    case 'config':
      embed
        .setColor(0x00ff00)
        .setTitle('⚙️ General Configuration')
        .setDescription('General bot settings');
      break;

    case 'whitelist':
      embed
        .setColor(0xffaa00)
        .setTitle('📋 Whitelist Management')
        .setDescription('Manage whitelist entries');
      break;

    case 'logs':
      embed
        .setColor(0x0099ff)
        .setTitle('📜 Log Configuration')
        .setDescription('Configure logging channels');
      break;
  }

  const components = buildDashboardRows(section);

  if (interaction.deferred) {
    await interaction.editReply({ embeds: [embed], components });
  } else {
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  }
}

function buildDashboardRows(section) {
  const rows = [];

  if (section === 'main') {
    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dashboard_protection')
          .setLabel('🛡️ Protection')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('dashboard_config')
          .setLabel('⚙️ Configuration')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('dashboard_whitelist')
          .setLabel('📋 Whitelist')
          .setStyle(ButtonStyle.Primary)
      )
    );

    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dashboard_logs')
          .setLabel('📜 Logs')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('dashboard_tools')
          .setLabel('🔧 Tools')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('dashboard_back')
          .setLabel('🔙 Back')
          .setStyle(ButtonStyle.Secondary)
      )
    );
  } else {
    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dashboard_main')
          .setLabel('🔙 Main Menu')
          .setStyle(ButtonStyle.Secondary)
      )
    );
  }

  return rows;
}

// ====================== BUTTON HANDLERS ======================

async function handleDashboardButton(interaction, client, args) {
  const section = args.section || 'main';

  if (section === 'back') {
    await sendDashboard(interaction, client, 'main');
    return;
  }

  await sendDashboard(interaction, client, section);
}

async function handleConfigButton(interaction, client, args) {
  await interaction.reply({
    content: '⚙️ **Configuration Panel**\nUse `/config` command to configure specific settings.',
    ephemeral: true,
  });
}

async function handleShieldButton(interaction, client, args) {
  const guildId = interaction.guild.id;
  const config = client.guildConfigs.get(guildId) || {};
  const shieldEnabled = config.shieldEnabled !== false;
  const antiSpamEnabled = config.antiSpamEnabled !== false;
  const autoModEnabled = config.autoModEnabled !== false;

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Shield Status')
    .setColor(shieldEnabled ? 0x00ff00 : 0xff0000)
    .addFields(
      { name: 'UltraShield', value: shieldEnabled ? '✅ Active' : '❌ Disabled', inline: true },
      { name: 'Anti-Spam', value: antiSpamEnabled ? '✅ Active' : '❌ Disabled', inline: true },
      { name: 'Auto-Mod', value: autoModEnabled ? '✅ Active' : '❌ Disabled', inline: true },
      { name: 'Anti-Raid', value: client.raidMode?.get(guildId)?.active ? '🔒 ACTIVE' : '🟢 Inactive', inline: true }
    );

  const components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('shield_toggle')
      .setLabel(shieldEnabled ? '🔴 Disable Shield' : '🟢 Enable Shield')
      .setStyle(shieldEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('shield_info')
      .setLabel('ℹ️ Info')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('shield_whitelist')
      .setLabel('👥 Whitelist')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}

async function handleRaidModeButton(interaction, client, args) {
  if (!interaction.member.permissions.has('Administrator')) {
    await interaction.reply({
      content: '❌ Administrator permission required.',
      ephemeral: true,
    });
    return;
  }

  const guildId = interaction.guild.id;
  const raidState = client.raidMode?.get(guildId);
  const isActive = raidState?.active;

  if (args.action === 'run') {
    const { enableRaidMode, disableRaidMode } = await import('./raidHandler.js');

    if (isActive) {
      await disableRaidMode(interaction.guild, client);
      await interaction.update({
        content: '🟢 **Raid Mode disabled.** Channels unlocked.',
        embeds: [],
        components: [],
      });
    } else {
      const count = await enableRaidMode(
        interaction.guild,
        interaction.user.tag,
        client
      );
      await interaction.update({
        content: `🔒 **Raid Mode enabled.** ${count} channels locked.`,
        embeds: [],
        components: [],
      });
    }
    return;
  }

  if (args.action === 'info') {
    const { getRaidStatus } = await import('./raidHandler.js');
    const status = getRaidStatus(guildId, client);

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Raid Mode Info')
      .setColor(isActive ? 0xff0000 : 0x00ff00)
      .addFields(
        { name: 'Status', value: isActive ? '🔒 ACTIVE' : '🟢 Inactive', inline: true },
        { name: 'Type', value: status.type || 'None', inline: true },
        { name: 'Triggered By', value: status.triggeredBy || '-', inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // Default: show status buttons
  const embed = new EmbedBuilder()
    .setTitle('🛡️ Raid Mode')
    .setColor(isActive ? 0xff0000 : 0x00ff00)
    .setDescription(
      isActive
        ? '🔒 Raid mode is **ACTIVE** - All channels are locked.'
        : '🟢 Raid mode is **inactive**.'
    );

  const components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('raidmode_run')
      .setLabel(isActive ? '🟢 Disable Raid Mode' : '🔒 Enable Raid Mode')
      .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('raidmode_info')
      .setLabel('ℹ️ Info')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('raidmode_help')
      .setLabel('❓ Help')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}

async function handleWhitelistButton(interaction, client, args) {
  const guildId = interaction.guild.id;
  const { getWhitelist } = await import('../../database/db.js');
  const whitelist = await getWhitelist(guildId);

  const embed = new EmbedBuilder()
    .setTitle('📋 Whitelist Management')
    .setColor(0xffaa00)
    .addFields(
      {
        name: 'Users',
        value: whitelist.users?.length > 0
          ? whitelist.users.map((id) => `<@${id}>`).join(', ')
          : 'None',
        inline: false,
      },
      {
        name: 'Roles',
        value: whitelist.roles?.length > 0
          ? whitelist.roles.map((id) => `<@&${id}>`).join(', ')
          : 'None',
        inline: false,
      },
      {
        name: 'Channels',
        value: whitelist.channels?.length > 0
          ? whitelist.channels.map((id) => `<#${id}>`).join(', ')
          : 'None',
        inline: false,
      }
    )
    .setDescription('Use `/whitelist add/remove` to manage entries.');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleAntiSpamButton(interaction, client, args) {
  const guildId = interaction.guild.id;
  const config = client.guildConfigs.get(guildId) || {};

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Anti-Spam Settings')
    .setColor(0xff6600)
    .setDescription('Configure anti-spam protection.')
    .addFields(
      { name: 'Status', value: config.antiSpamEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
      { name: 'Threshold', value: String(config.spamThreshold || 5), inline: true }
    );

  const components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('antispam_toggle')
      .setLabel(config.antiSpamEnabled ? '🔴 Disable' : '🟢 Enable')
      .setStyle(config.antiSpamEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('antispam_config')
      .setLabel('⚙️ Configure')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}

async function handleDerankButton(interaction, client, args) {
  const guildId = interaction.guild.id;
  const config = client.guildConfigs.get(guildId) || {};

  const embed = new EmbedBuilder()
    .setTitle('⚠️ Derank Settings')
    .setColor(0xff0000)
    .setDescription('Configure derank protection thresholds.')
    .addFields(
      { name: 'Ban Threshold', value: String(config.derankThreshold || 3), inline: true },
      { name: 'Channel Delete Threshold', value: String(config.channelDeleteThreshold || 3), inline: true },
      { name: 'Role Delete Threshold', value: String(config.roleDeleteThreshold || 3), inline: true }
    );

  const components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('derank_info')
      .setLabel('ℹ️ Info')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('derank_reset')
      .setLabel('🔄 Reset Scores')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}

async function handleLogsButton(interaction, client, args) {
  const guildId = interaction.guild.id;
  const config = client.guildConfigs.get(guildId) || {};

  const logChannel = config.logChannel
    ? `<#${config.logChannel}>`
    : 'Not set';

  const embed = new EmbedBuilder()
    .setTitle('📜 Log Configuration')
    .setColor(0x0099ff)
    .addFields(
      { name: 'Mod Log Channel', value: logChannel, inline: true },
      { name: 'Anti-Raid Log', value: config.raidLogChannel ? `<#${config.raidLogChannel}>` : 'Default', inline: true },
      { name: 'AutoMod Log', value: config.autoModLogChannel ? `<#${config.autoModLogChannel}>` : 'Default', inline: true }
    )
    .setDescription('Use `/config logs #channel` to set log channels.');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
