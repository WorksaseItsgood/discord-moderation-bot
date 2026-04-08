const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;

    const customId = interaction.customId;

    // Ban buttons
    if (customId.startsWith('ban_')) {
      await handleBanButton(interaction, client);
    }

    // Kick buttons
    if (customId.startsWith('kick_')) {
      await handleKickButton(interaction, client);
    }

    // Mute buttons
    if (customId.startsWith('mute_')) {
      await handleMuteButton(interaction, client);
    }

    // Warn buttons
    if (customId.startsWith('warn_')) {
      await handleWarnButton(interaction, client);
    }

    // Shield buttons
    if (customId.startsWith('shield_')) {
      await handleShieldButton(interaction, client);
    }

    // Purge buttons
    if (customId.startsWith('purge_')) {
      await handlePurgeButton(interaction, client);
    }

    // Lock/Unlock buttons
    if (customId.startsWith('lock_') || customId.startsWith('unlock_')) {
      await handleLockUnlockButton(interaction, client);
    }

    // Tempban buttons
    if (customId.startsWith('tempban_')) {
      await handleTempbanButton(interaction, client);
    }

    // Slowmode buttons
    if (customId.startsWith('slowmode_')) {
      await handleSlowmodeButton(interaction, client);
    }
  }
};

// ========== BAN HANDLER ==========
async function handleBanButton(interaction, client) {
  const [action, userId] = interaction.customId.split('_').slice(1);

  if (action === 'cancel') {
    await interaction.update({
      content: '❌ Ban annulé.',
      embeds: [],
      components: []
    });
    return;
  }

  if (action === 'confirm') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
      await interaction.update({ content: '❌ Utilisateur non trouvé.', embeds: [], components: [] });
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) {
        await member.ban({ reason: `Ban par ${interaction.user.tag}` });
      } else {
        await interaction.guild.members.ban(userId, { reason: `Ban par ${interaction.user.tag}` });
      }

      await interaction.update({
        content: `✅ **${user.tag}** a été banni.`,
        embeds: [],
        components: []
      });
    } catch (e) {
      await interaction.update({
        content: `❌ Erreur: ${e.message}`,
        embeds: [],
        components: []
      });
    }
  }
}

// ========== KICK HANDLER ==========
async function handleKickButton(interaction, client) {
  const [action, userId] = interaction.customId.split('_').slice(1);

  if (action === 'cancel') {
    await interaction.update({
      content: '❌ Kick annulé.',
      embeds: [],
      components: []
    });
    return;
  }

  if (action === 'confirm') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
      await interaction.update({ content: '❌ Utilisateur non trouvé.', embeds: [], components: [] });
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) {
        await interaction.update({ content: '❌ Impossible de kick ce membre.', embeds: [], components: [] });
        return;
      }

      await member.kick(`Kick par ${interaction.user.tag}`);

      await interaction.update({
        content: `✅ **${user.tag}** a été kick.`,
        embeds: [],
        components: []
      });
    } catch (e) {
      await interaction.update({
        content: `❌ Erreur: ${e.message}`,
        embeds: [],
        components: []
      });
    }
  }
}

// ========== MUTE HANDLER ==========
async function handleMuteButton(interaction, client) {
  const [action, userId] = interaction.customId.split('_').slice(1);

  if (action === 'cancel') {
    await interaction.update({ content: '❌ Mute annulé.', embeds: [], components: [] });
    return;
  }

  if (action === 'confirm') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
      await interaction.update({ content: '❌ Utilisateur non trouvé.', embeds: [], components: [] });
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) {
        await interaction.update({ content: '❌ Membre non trouvé sur le serveur.', embeds: [], components: [] });
        return;
      }

      // Mute pour 24h par défaut
      await member.timeout(24 * 60 * 60 * 1000, `Mute par ${interaction.user.tag}`);

      await interaction.update({
        content: `✅ **${user.tag}** a été mute (24h).`,
        embeds: [],
        components: []
      });
    } catch (e) {
      await interaction.update({
        content: `❌ Erreur: ${e.message}`,
        embeds: [],
        components: []
      });
    }
  }

  if (action === '1h') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;
    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) await member.timeout(60 * 60 * 1000, `Mute 1h par ${interaction.user.tag}`);
      await interaction.update({ content: `✅ **${user.tag}** mute 1h.`, embeds: [], components: [] });
    } catch (e) {
      await interaction.update({ content: `❌ Erreur: ${e.message}`, embeds: [], components: [] });
    }
  }

  if (action === '24h') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;
    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) await member.timeout(24 * 60 * 60 * 1000, `Mute 24h par ${interaction.user.tag}`);
      await interaction.update({ content: `✅ **${user.tag}** mute 24h.`, embeds: [], components: [] });
    } catch (e) {
      await interaction.update({ content: `❌ Erreur: ${e.message}`, embeds: [], components: [] });
    }
  }
}

// ========== WARN HANDLER ==========
async function handleWarnButton(interaction, client) {
  const [action, userId] = interaction.customId.split('_').slice(1);

  if (action === 'cancel') {
    await interaction.update({ content: '❌ Action annulée.', embeds: [], components: [] });
    return;
  }

  if (action === 'add') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
      await interaction.update({ content: '❌ Utilisateur non trouvé.', embeds: [], components: [] });
      return;
    }

    // Ajouter un warn
    if (!client.warnings) client.warnings = new Map();
    const warns = client.warnings.get(userId) || [];
    warns.push({
      reason: 'Avertissement',
      by: interaction.user.tag,
      time: Date.now()
    });
    client.warnings.set(userId, warns);

    await interaction.update({
      content: `⚠️ **${user.tag}** a reçu un avertissement. (Total: ${warns.length})`,
      embeds: [],
      components: []
    });
  }

  if (action === 'list') {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;

    const warns = client.warnings.get(userId) || [];
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Avertissements - ${user.tag}`)
      .setColor(16776960)
      .setDescription(warns.length === 0 ? 'Aucun avertissement.' : warns.map((w, i) => `${i + 1}. ${w.reason} (par ${w.by})`).join('\n'))
      .setFooter({ text: `Total: ${warns.length} avertissement(s)` });

    await interaction.update({ embeds: [embed], components: [] });
  }
}

// ========== PURGE HANDLER ==========
async function handlePurgeButton(interaction, client) {
  const channel = interaction.channel;

  if (!interaction.member.permissions.has('ManageMessages')) {
    await interaction.reply({ content: '❌ Permission requise: Gérer les messages.', ephemeral: true });
    return;
  }

  const customId = interaction.customId;

  if (customId === 'purge_cancel') {
    await interaction.update({ content: '❌ Purge annulée.', embeds: [], components: [] });
    return;
  }

  let amount = 0;
  if (customId === 'purge_10') amount = 10;
  else if (customId === 'purge_50') amount = 50;
  else if (customId === 'purge_100') amount = 100;

  if (amount <= 0) return;

  try {
    const messages = await channel.messages.fetch({ limit: amount });
    const deletable = messages.filter(m => Date.now() - m.createdTimestamp < 1209600000);

    if (deletable.size === 0) {
      await interaction.update({ content: '❌ Aucun message à supprimer.', embeds: [], components: [] });
      return;
    }

    await channel.bulkDelete(deletable, true);
    await interaction.update({
      content: `🗑️ ${deletable.size} message(s) supprimés.`,
      embeds: [],
      components: []
    });
  } catch (e) {
    await interaction.update({ content: `❌ Erreur: ${e.message}`, embeds: [], components: [] });
  }
}

// ========== LOCK/UNLOCK ==========
async function handleLockUnlockButton(interaction, client) {
  const channel = interaction.channel;

  if (!interaction.member.permissions.has('ManageChannels')) {
    await interaction.reply({ content: '❌ Permission requise: Gérer les salons.', ephemeral: true });
    return;
  }

  const customId = interaction.customId;

  if (customId === 'lock_channel') {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.update({ content: `🔒 Salon verrouillé par ${interaction.user}.`, embeds: [], components: [] });
  } else if (customId === 'unlock_channel') {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.update({ content: `🔓 Salon déverrouillé par ${interaction.user}.`, embeds: [], components: [] });
  } else if (customId === 'lock_all') {
    const channels = interaction.guild.channels.cache.filter(c => c.type === 0);
    for (const ch of channels.values()) {
      try {
        await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      } catch (e) {}
    }
    await interaction.update({ content: `🔐 ${channels.size} salons verrouillés par ${interaction.user}.`, embeds: [], components: [] });
  }
}

// ========== TEMPBAN ==========
async function handleTempbanButton(interaction, client) {
  const [action, userId] = interaction.customId.split('_').slice(1);

  if (!interaction.member.permissions.has('BanMembers')) {
    await interaction.reply({ content: '❌ Permission requise: Bannir des membres.', ephemeral: true });
    return;
  }

  const durations = { '1h': 3600000, '24h': 86400000, '7d': 604800000 };

  if (durations[action] && userId) {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;

    try {
      await interaction.guild.members.ban(userId, { deleteMessageSeconds: 604800 });
      await interaction.update({
        content: `⏰ **${user.tag}** banni ${action}.`,
        embeds: [],
        components: []
      });
    } catch (e) {
      await interaction.update({ content: `❌ Erreur: ${e.message}`, embeds: [], components: [] });
    }
  }
}

// ========== SLOWMODE ==========
async function handleSlowmodeButton(interaction, client) {
  const channel = interaction.channel;

  if (!interaction.member.permissions.has('ManageChannels')) {
    await interaction.reply({ content: '❌ Permission requise: Gérer les salons.', ephemeral: true });
    return;
  }

  const delays = { 'off': 0, '5s': 5, '10s': 10, '30s': 30, '1m': 60 };
  const labels = { 'off': 'désactivé', '5s': '5 secondes', '10s': '10 secondes', '30s': '30 secondes', '1m': '1 minute' };

  const parts = interaction.customId.split('_');
  const key = parts.slice(1).join('_');

  if (delays[key] !== undefined) {
    await channel.setRateLimitPerUser(delays[key]);
    await interaction.update({
      content: `🐌 Slowmode: **${labels[key]}** par ${interaction.user}.`,
      embeds: [],
      components: []
    });
  }
}

// ========== SHIELD ==========
async function handleShieldButton(interaction, client) {
  const guildId = interaction.guild.id;
  if (!client.shieldConfig) client.shieldConfig = new Map();
  if (!client.raidConfig) client.raidConfig = new Map();

  const config = client.shieldConfig.get(guildId) || { enabled: true, antiBotAdd: true, antiChannelDelete: true, antiRoleDelete: true, antiWebhook: true, antiBanWave: true, antiKickWave: true };
  const raidConfig = client.raidConfig.get(guildId) || { enabled: false, whitelist: [] };

  switch (interaction.customId) {
    case 'shield_toggle':
      config.enabled = !config.enabled;
      raidConfig.enabled = config.enabled;
      client.shieldConfig.set(guildId, config);
      client.raidConfig.set(guildId, raidConfig);
      await interaction.reply({ content: config.enabled ? '🛡️ UltraShield Activé!' : '🔴 UltraShield Désactivé!', ephemeral: true });
      break;

    case 'shield_whitelist':
      await interaction.reply({ content: '👥 Whitelist: `/shield whitelist @user`', ephemeral: true });
      break;

    case 'shield_logs':
      await interaction.reply({ content: '📜 Logs: `/shield logs #salon`', ephemeral: true });
      break;

    case 'shield_info':
      const infoEmbed = new EmbedBuilder()
        .setTitle('🛡️ UltraShield v2')
        .setColor(0x5865F2)
        .setDescription('Système anti-raid advanced.')
        .addFields(
          { name: 'Anti-Bot-Add', value: config.antiBotAdd ? '✅' : '❌', inline: true },
          { name: 'Anti-Channel-Delete', value: config.antiChannelDelete ? '✅' : '❌', inline: true },
          { name: 'Anti-Role-Delete', value: config.antiRoleDelete ? '✅' : '❌', inline: true },
          { name: 'Anti-Ban-Wave', value: config.antiBanWave ? '✅' : '❌', inline: true },
          { name: 'Anti-Kick-Wave', value: config.antiKickWave ? '✅' : '❌', inline: true }
        );
      await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
      break;

    case 'shield_status':
      const isLocked = client.shieldLocked?.get(guildId);
      const statusEmbed = new EmbedBuilder()
        .setTitle('🛡️ Status')
        .setColor(0x5865F2)
        .addFields(
          { name: 'Protection', value: config.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
          { name: 'Raid Mode', value: isLocked ? '🔒 ACTIF' : '🟢 Libre', inline: true }
        );
      await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
      break;
  }
}
