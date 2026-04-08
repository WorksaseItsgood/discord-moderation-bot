const { EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;

    const { ultraShield } = client.modules || {};

    // Handle shield buttons
    if (interaction.customId.startsWith('shield_')) {
      await handleShieldButton(interaction, client);
    }
  }
};

async function handleShieldButton(interaction, client) {
  const guildId = interaction.guild.id;
  const customId = interaction.customId;

  // Initialize config if not exists
  if (!client.shieldConfig) client.shieldConfig = new Map();
  const config = client.shieldConfig.get(guildId) || getDefaultConfig();

  let updated = false;

  switch (customId) {
    case 'shield_toggle_enabled':
      config.enabled = !config.enabled;
      updated = true;
      break;

    case 'shield_toggle_lock':
      await handleLockToggle(interaction, client, config);
      return;

    case 'shield_status':
      await handleStatus(interaction, client, config);
      return;

    case 'shield_toggle_antibot':
      config.antiBotAdd = !config.antiBotAdd;
      updated = true;
      break;

    case 'shield_toggle_channel':
      config.antiChannelDelete = !config.antiChannelDelete;
      updated = true;
      break;

    case 'shield_toggle_role':
      config.antiRoleDelete = !config.antiRoleDelete;
      updated = true;
      break;

    case 'shield_toggle_webhook':
      config.antiWebhook = !config.antiWebhook;
      updated = true;
      break;

    case 'shield_toggle_guild':
      config.antiGuildUpdate = !config.antiGuildUpdate;
      updated = true;
      break;

    case 'shield_toggle_ban':
      config.antiBanWave = !config.antiBanWave;
      updated = true;
      break;

    case 'shield_toggle_spam':
      config.antiSpam = !config.antiSpam;
      updated = true;
      break;

    case 'shield_toggle_kick':
      config.antiKickWave = !config.antiKickWave;
      updated = true;
      break;

    case 'shield_unlock':
      if (client.modules?.ultraShield) {
        await client.modules.ultraShield.unlockServer(interaction.guild, interaction.user, client);
        await interaction.reply({ content: '🔓 Serveur déverrouillé !', ephemeral: true });
      }
      return;

    case 'shield_log_channel':
      // Handle select menu
      const selectedChannel = interaction.values[0];
      config.logChannel = selectedChannel;
      client.shieldConfig.set(guildId, config);
      await interaction.reply({ content: `✅ Channel de logs défini: #${selectedChannel}`, ephemeral: true });
      return;

    case 'shield_threshold':
      const thresholds = {
        relaxed: { ban: 10, kick: 10, spam: 15 },
        normal: { ban: 5, kick: 5, spam: 7 },
        strict: { ban: 3, kick: 3, spam: 5 },
        paranoid: { ban: 2, kick: 2, spam: 3 }
      };
      const selected = thresholds[interaction.values[0]];
      config.banThreshold = selected.ban;
      config.kickThreshold = selected.kick;
      config.msgThreshold = selected.spam;
      client.shieldConfig.set(guildId, config);
      await interaction.reply({ content: `✅ Seuils mis à jour (${interaction.values[0]})`, ephemeral: true });
      return;

    case 'shield_whitelist':
      await interaction.reply({
        content: 'Pour whitelist un utilisateur, utilise `/shield whitelist <user>` ou ajoute son ID dans la config.',
        ephemeral: true
      });
      return;

    default:
      return;
  }

  if (updated) {
    client.shieldConfig.set(guildId, config);

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Config Updated')
      .setColor(0x00ff00)
      .setDescription('Ta configuration a été mise à jour.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Re-edit original message with new button states
    // This would require storing message ID - simplified here
  }
}

async function handleLockToggle(interaction, client, config) {
  const guildId = interaction.guild.id;
  const isLocked = client.shieldLocked?.get(guildId);

  if (isLocked) {
    // Unlock
    if (client.modules?.ultraShield) {
      await client.modules.ultraShield.unlockServer(interaction.guild, interaction.user, client);
    }
    await interaction.reply({ content: '🔓 Serveur déverrouillé manuellement.', ephemeral: true });
  } else {
    // Lock
    if (client.modules?.ultraShield) {
      await client.modules.ultraShield.triggerLockdown(interaction.guild, 'manual', client);
    }
    await interaction.reply({ content: '🔒 Serveur verrouillé manuellement.', ephemeral: true });
  }
}

async function handleStatus(interaction, client, config) {
  const guildId = interaction.guild.id;
  const isLocked = client.shieldLocked?.get(guildId);
  const history = client.raidHistory?.get(guildId) || [];

  const embed = new EmbedBuilder()
    .setTitle('🛡️ UltraShield Status')
    .setColor(0x5865F2)
    .addFields(
      { name: 'Protection', value: config.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
      { name: 'Raid Mode', value: isLocked ? '🔒 LOCKED' : '🟢 Libre', inline: true },
      { name: 'Anti-Bot', value: config.antiBotAdd ? '✅' : '❌', inline: true },
      { name: 'Anti-Channel', value: config.antiChannelDelete ? '✅' : '❌', inline: true },
      { name: 'Anti-Role', value: config.antiRoleDelete ? '✅' : '❌', inline: true },
      { name: 'Anti-Webhook', value: config.antiWebhook ? '✅' : '❌', inline: true },
      { name: 'Anti-BanWave', value: config.antiBanWave ? '✅' : '❌', inline: true },
      { name: 'Anti-KickWave', value: config.antiKickWave ? '✅' : '❌', inline: true },
      { name: 'Anti-Spam', value: config.antiSpam ? '✅' : '❌', inline: true },
      { name: 'Ban Threshold', value: String(config.banThreshold || 5), inline: true },
      { name: 'Kick Threshold', value: String(config.kickThreshold || 5), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
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
    antiSpam: true,
    banThreshold: 5,
    kickThreshold: 5,
    msgThreshold: 7
  };
}