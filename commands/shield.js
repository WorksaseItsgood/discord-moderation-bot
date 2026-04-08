const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'shield',
  description: '🛡️ UltraShield Control Panel',
  
  async execute(interaction, client) {
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: '❌ Tu as besoin de `ManageGuild` pour utiliser cette commande.', ephemeral: true });
    }

    const config = client.shieldConfig?.get(interaction.guild.id) || getDefaultConfig();

    const embed = new EmbedBuilder()
      .setTitle('🛡️ UltraShield Control Panel')
      .setColor(0x5865F2)
      .setDescription('Configure la protection anti-raid de ton serveur.')
      .addFields(
        { name: 'Protection Status', value: config.enabled ? '🟢 Active' : '🔴 Désactivée', inline: true },
        { name: 'Raid Mode', value: client.shieldLocked?.get(interaction.guild.id) ? '🔒 Locked' : '🟢 Libre', inline: true }
      )
      .setFooter({ text: 'UltraShield v2 • Configurable via boutons ci-dessous' })
      .setTimestamp();

    const rows = buildButtons(config, client);

    await interaction.reply({ embeds: [embed], components: rows, ephemeral: false });
  }
};

function buildButtons(config, client) {
  const rows = [];

  // Row 1: Main toggles
  const mainRow = new ActionRowBuilder();

  const enabledBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_enabled')
    .setLabel(config.enabled ? '🔴 Désactiver' : '🟢 Activer')
    .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success);

  const lockBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_lock')
    .setLabel('🔒 Lock/Unlock')
    .setStyle(ButtonStyle.Secondary);

  const statusBtn = new ButtonBuilder()
    .setCustomId('shield_status')
    .setLabel('📊 Status')
    .setStyle(ButtonStyle.Primary);

  mainRow.addComponents(enabledBtn, lockBtn, statusBtn);

  // Row 2: Anti-nuke toggles
  const antiNukeRow = new ActionRowBuilder();

  const antiBotBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_antibot')
    .setLabel(config.antiBotAdd ? '🤖 Anti-Bot ✅' : '🤖 Anti-Bot ❌')
    .setStyle(ButtonStyle.Secondary);

  const antiChannelBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_channel')
    .setLabel(config.antiChannelDelete ? '📁 Anti-Channel ✅' : '📁 Anti-Channel ❌')
    .setStyle(ButtonStyle.Secondary);

  const antiRoleBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_role')
    .setLabel(config.antiRoleDelete ? '🎭 Anti-Role ✅' : '🎭 Anti-Role ❌')
    .setStyle(ButtonStyle.Secondary);

  antiNukeRow.addComponents(antiBotBtn, antiChannelBtn, antiRoleBtn);

  // Row 3: More protection toggles
  const moreRow = new ActionRowBuilder();

  const antiWebhookBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_webhook')
    .setLabel(config.antiWebhook ? '🪝 Anti-Webhook ✅' : '🪝 Anti-Webhook ❌')
    .setStyle(ButtonStyle.Secondary);

  const antiGuildBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_guild')
    .setLabel(config.antiGuildUpdate ? '⚙️ Anti-Guild ✅' : '⚙️ Anti-Guild ❌')
    .setStyle(ButtonStyle.Secondary);

  const antiBanBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_ban')
    .setLabel(config.antiBanWave ? '🚫 Anti-BanWave ✅' : '🚫 Anti-BanWave ❌')
    .setStyle(ButtonStyle.Secondary);

  moreRow.addComponents(antiWebhookBtn, antiGuildBtn, antiBanBtn);

  // Row 4: Anti-spam & kick
  const spamRow = new ActionRowBuilder();

  const antiSpamBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_spam')
    .setLabel(config.antiSpam ? '📝 Anti-Spam ✅' : '📝 Anti-Spam ❌')
    .setStyle(ButtonStyle.Secondary);

  const antiKickBtn = new ButtonBuilder()
    .setCustomId('shield_toggle_kick')
    .setLabel(config.antiKickWave ? '👢 Anti-KickWave ✅' : '👢 Anti-KickWave ❌')
    .setStyle(ButtonStyle.Secondary);

  const whitelistBtn = new ButtonBuilder()
    .setCustomId('shield_whitelist')
    .setLabel('✅ Whitelist')
    .setStyle(ButtonStyle.Success);

  spamRow.addComponents(antiSpamBtn, antiKickBtn, whitelistBtn);

  // Row 5: Log channel & thresholds selector
  const configRow = new ActionRowBuilder();

  const logChannelSelect = new SelectMenuBuilder()
    .setCustomId('shield_log_channel')
    .setPlaceholder('📝 Channel de logs')
    .addOptions(
      { label: 'shield-logs', value: 'shield-logs' },
      { label: 'mod-logs', value: 'mod-logs' },
      { label: 'anti-raid', value: 'anti-raid' }
    );

  const thresholdSelect = new SelectMenuBuilder()
    .setCustomId('shield_threshold')
    .setPlaceholder('🎯 Seuils')
    .addOptions(
      { label: 'Relaxed (10)', value: 'relaxed' },
      { label: 'Normal (5)', value: 'normal' },
      { label: 'Strict (3)', value: 'strict' },
      { label: 'Paranoid (2)', value: 'paranoid' }
    );

  configRow.addComponents(logChannelSelect, thresholdSelect);

  rows.push(mainRow, antiNukeRow, moreRow, spamRow, configRow);

  return rows;
}

function getDefaultConfig() {
  return {
    enabled: true,
    antiBotAdd: true,
    antiChannelDelete: true,
    antiRoleDelete: true,
    antiWebhook: true,
    antiGuildUpdate: true,
    antiBanWave: true,
    antiKickWave: true,
    antiSpam: true
  };
}