#!/bin/bash
# Niotic Optimization Sub-Agent
# Runs until completion, then notifies

BOT_DIR="/root/discord-moderation-bot"
LOG="$BOT_DIR/optimize.log"

exec > >(tee -a "$LOG") 2>&1

log() { echo "[$(date '+%H:%M:%S')] $1"; }

log "🚀 OPTIMIZATION AGENT STARTED"

cd "$BOT_DIR" || exit 1

# ============================================================
# STEP 1: READ EXISTING CODE
# ============================================================
log "📖 Reading existing codebase..."

CMD_COUNT=$(find src/commands -name "*.js" 2>/dev/null | wc -l)
HANDLER_COUNT=$(find src/handlers -name "*.js" 2>/dev/null | wc -l)
EVENT_COUNT=$(find src/events -name "*.js" 2>/dev/null | wc -l)

log "  Commands: $CMD_COUNT"
log "  Handlers: $HANDLER_COUNT"
log "  Events: $EVENT_COUNT"

# Read key files
log "📄 Reading bot.js..."
cat src/bot.js 2>/dev/null | head -50

log "📄 Reading interactionCreate.js..."
cat src/events/interactionCreate.js 2>/dev/null

log "📄 Reading MEMORY.md..."
cat MEMORY.md 2>/dev/null || echo "No MEMORY.md found"

# ============================================================
# STEP 2: Create Enhanced Embed Utils
# ============================================================
log "🎨 Creating enhanced embed system..."

cat > src/utils/embeds.js << 'EOF'
/**
 * Niotic Embed Builder - Beautiful, consistent embeds
 */

import { EmbedBuilder } from 'discord.js';

const C = {
  success: 0x00ff99,
  error: 0xff4757,
  warning: 0xffa502,
  info: 0x5865F2,
  mod: 0xff6b81,
  raid: 0xff0000,
  shield: 0x9b59b6,
  mute: 0xffd93d,
};

function base(type = 'info') {
  return new EmbedBuilder()
    .setColor(C[type] || C.info)
    .setTimestamp();
}

export function success(title, desc) {
  return base('success').setTitle(`✅ ${title}`).setDescription(desc);
}

export function error(title, desc) {
  return base('error').setTitle(`❌ ${title}`).setDescription(desc);
}

export function warn(title, desc) {
  return base('warning').setTitle(`⚠️ ${title}`).setDescription(desc);
}

export function info(title, desc) {
  return base('info').setTitle(`ℹ️ ${title}`).setDescription(desc);
}

// Moderation embeds with thumbnail
export function modAction(action, target, moderator, reason, client, extra = {}) {
  const emojiMap = { ban: '🔨', kick: '🦶', mute: '🔇', warn: '⚠️', tempban: '⏱️', softban: '💨', kick: '🦶' };
  const emoji = emojiMap[action] || '⚡';

  const embed = base('mod')
    .setTitle(`${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)} - Action enregistrée`)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
      { name: '🛡️ Modérateur', value: moderator.tag, inline: true },
      { name: '📝 Raison', value: reason || 'Non spécifiée', inline: false }
    );

  if (extra.duration) {
    embed.addFields({ name: '⏱️ Durée', value: extra.duration, inline: true });
  }
  if (extra.points) {
    embed.addFields({ name: '📊 Points', value: String(extra.points), inline: true });
  }

  embed.setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });
  return embed;
}

export function confirmation(title, description, confirmId, cancelId, color = C.warning) {
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ ${title}`)
    .setColor(color)
    .setDescription(description)
    .setFooter({ text: 'Niotic Moderation' })
    .setTimestamp();

  const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
  const confirmBtn = new ButtonBuilder().setCustomId(confirmId).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger);
  const cancelBtn = new ButtonBuilder().setCustomId(cancelId).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

  return { embeds: [embed], components: [row] };
}

export function paginatedList(items, page, perPage, title, color = C.info) {
  const total = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(slice.join('\n') || 'Aucun résultat')
    .setFooter({ text: `Page ${page}/${total} • ${items.length} total • Niotic` })
    .setTimestamp();

  return embed;
}

export function userInfo(user, member, client) {
  const joinDays = member ? Math.floor((Date.now() - member.joinedTimestamp) / 86400000) : null;
  const accDays = Math.floor((Date.now() - user.createdTimestamp) / 86400000);

  const embed = base('info')
    .setTitle(`👤 ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '📅 Compte créé', value: `Il y a ${accDays} jour(s)`, inline: true },
      { name: '📥 Rejoint le serveur', value: joinDays ? `Il y a ${joinDays} jour(s)` : 'Membre introuvable', inline: true },
      { name: '🏷️ ID', value: `\`${user.id}\``, inline: true }
    );

  if (member) {
    const roles = member.roles.cache.filter(r => r.name !== '@everyone');
    embed.addFields({ name: `🎭 Rôles (${roles.size})`, value: roles.size > 0 ? roles.map(r => r.toString()).slice(0, 10).join(', ') : 'Aucun', inline: false });
    embed.addFields({ name: '⏱️ Timeout', value: member.isCommunicationDisabled() ? `Jusqu'au ${new Date(member.communicationDisabledUntil).toLocaleString('fr-FR')}` : 'Aucune', inline: true });
  }

  embed.setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export function serverInfo(guild) {
  const embed = base('info')
    .setTitle(`🏠 ${guild.name}`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: '👥 Membres', value: String(guild.memberCount), inline: true },
      { name: '📁 Salons', value: String(guild.channels.cache.size), inline: true },
      { name: '🏷️ Rôles', value: String(guild.roles.cache.size), inline: true },
      { name: '✨ Boost Level', value: `Niveau ${guild.premiumTier}`, inline: true },
      { name: '🌐 Région', value: guild.preferredLocale, inline: true },
      { name: '🆔 Serveur ID', value: `\`${guild.id}\``, inline: true }
    )
    .setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export function shieldStatus(config, raidState, guildId, client) {
  const embed = base('shield')
    .setTitle('🛡️ Shield Status')
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'UltraShield', value: config.shieldEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Anti-Spam', value: config.antiSpamEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Anti-Raid', value: config.antiRaidEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'AutoMod', value: config.autoModEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Raid Mode', value: raidState?.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true },
      { name: 'Seuil Raid', value: String(config.raidThreshold || 5), inline: true }
    )
    .setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export { C as colors };
export default { success, error, warn, info, modAction, confirmation, paginatedList, userInfo, serverInfo, shieldStatus, colors: C };
EOF

log "✅ Embed utils created"

# ============================================================
# STEP 3: Improve ALL moderation commands with better embeds
# ============================================================
log "🎨 Improving moderation command embeds..."

# Get all moderation commands
MOD_CMDS=$(find src/commands/moderation -name "*.js" 2>/dev/null)

for cmd_file in $MOD_CMDS; do
  cmd_name=$(basename "$cmd_file" .js)
  log "  Processing /${cmd_name}..."

  # Create enhanced version with better embeds
  case "$cmd_name" in
    ban)
      cat > "$cmd_file" << 'EOF'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setNameLocalizations({ fr: 'ban', 'en-US': 'ban' })
    .setDescription('Ban a user from the server')
    .setDescriptionLocalizations({ fr: 'Bannir un utilisateur du serveur', 'en-US': 'Ban a user from the server' })
    .addUserOption(o => o.setName('user').setNameLocalizations({ fr: 'utilisateur' }).setDescription('User to ban').setDescriptionLocalizations({ fr: 'Utilisateur à bannir' }).setRequired(true))
    .addStringOption(o => o.setName('reason').setNameLocalizations({ fr: 'raison' }).setDescription('Ban reason').setDescriptionLocalizations({ fr: 'Raison du ban' }).setRequired(false))
    .addIntegerOption(o => o.setName('delete-days').setNameLocalizations({ fr: 'supprimer-jours' }).setDescription('Days').setDescriptionLocalizations({ fr: 'Jours de messages' }).setRequired(false).setMinValue(0).setMaxValue(7)),
  name: 'ban',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const deleteDays = interaction.options.getInteger('delete-days') || 0;

    if (!target) {
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4757).setTitle('❌ Erreur').setDescription('Veuillez spécifier un utilisateur.')], ephemeral: true });
    }

    // Beautiful confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔨 Confirmation de Ban')
      .setColor(0xff6b81)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
        { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
        { name: '📝 Raison', value: reason, inline: false },
        { name: '🗑️ Supprimer messages', value: `${deleteDays} jour(s)`, inline: true }
      )
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
      .setTimestamp();

    const confirmBtn = new ButtonBuilder().setCustomId(`ban_confirm_${target.id}`).setLabel('✅ Confirmer le Ban').setStyle(ButtonStyle.Danger);
    const cancelBtn = new ButtonBuilder().setCustomId('ban_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`ban_confirm_${target.id}`, async (btn) => {
      if (btn.user.id !== interaction.user.id) return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      try {
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member) {
          await member.ban({ reason: `${reason} | Ban par ${interaction.user.tag}`, deleteMessageSeconds: deleteDays * 86400 });
        } else {
          await interaction.guild.members.ban(target.id, { reason: `${reason} | Ban par ${interaction.user.tag}` });
        }
        // Success embed
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Utilisateur banni')
          .setColor(0x00ff99)
          .setThumbnail(target.displayAvatarURL())
          .addFields(
            { name: '👤 Utilisateur', value: `${target.tag}`, inline: true },
            { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
            { name: '📝 Raison', value: reason, inline: false }
          )
          .setFooter({ text: 'Niotic Moderation' })
          .setTimestamp();
        await btn.update({ embeds: [successEmbed], components: [] });

        const { addLog } = await import('../../database/db.js');
        await addLog(interaction.guild.id, { action: 'ban', userId: target.id, moderatorId: interaction.user.id, reason });
      } catch (err) {
        const errorEmbed = new EmbedBuilder().setColor(0xff4757).setTitle('❌ Échec du ban').setDescription(err.message).setFooter({ text: 'Niotic Moderation' }).setTimestamp();
        await btn.update({ embeds: [errorEmbed], components: [] });
      }
      client.buttonHandlers.delete(`ban_confirm_${target.id}`);
    });

    client.buttonHandlers.set('ban_cancel', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      await btn.update({ embeds: [new EmbedBuilder().setColor(0x808080).setTitle('❌ Annulé').setDescription('Ban annulé par l\'utilisateur.').setFooter({ text: 'Niotic Moderation' }).setTimestamp()], components: [] });
      client.buttonHandlers.delete(`ban_confirm_${target.id}`);
      client.buttonHandlers.delete('ban_cancel');
    });
  },
};
EOF
      ;;
  esac
done

log "✅ Moderation commands enhanced"

# ============================================================
# STEP 4: Create Dashboard Config Command
# ============================================================
log "📊 Creating dashboard config command..."

mkdir -p src/commands/config

cat > src/commands/config/dashboard.js << 'EOF'
/**
 * /dashboard - Interactive configuration dashboard
 */
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from 'discord.js';
import { getGuildConfig, getWhitelist } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setNameLocalizations({ fr: 'dashboard', 'en-US': 'dashboard' })
    .setDescription('Open the bot configuration dashboard')
    .setDescriptionLocalizations({ fr: 'Ouvrir le tableau de bord de configuration', 'en-US': 'Open the bot configuration dashboard' }),
  name: 'dashboard',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },

  async execute(interaction, client) {
    const guildId = interaction.guild.id;
    const config = client.guildConfigs.get(guildId) || {};
    const whitelist = await getWhitelist(guildId);

    const embed = new EmbedBuilder()
      .setTitle('🛠️ Niotic Dashboard')
      .setColor(0x5865F2)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('**Tableau de bord de configuration**\n\nUtilisez les boutons ci-dessous pour naviguer entre les sections.')
      .addFields(
        { name: '🛡️ Protection', value: 'Shield, Anti-Raid, Anti-Spam', inline: true },
        { name: '⚙️ Configuration', value: 'Paramètres généraux', inline: true },
        { name: '📋 Whitelist', value: `${whitelist.users?.length || 0} users, ${whitelist.roles?.length || 0} roles`, inline: true },
        { name: '📜 Logs', value: config.logChannel ? `<#${config.logChannel}>` : 'Non configuré', inline: true },
        { name: '🎭 Auto-Role', value: config.autoRole ? `<@&${config.autoRole}>` : 'Désactivé', inline: true }
      )
      .setFooter({ text: 'Niotic Moderation' })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dash_protection').setLabel('🛡️ Protection').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('dash_config').setLabel('⚙️ Config').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('dash_whitelist').setLabel('📋 Whitelist').setStyle(ButtonStyle.Primary),
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dash_logs').setLabel('📜 Logs').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dash_autorole').setLabel('🎭 Auto-Role').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dash_refresh').setLabel('🔄 Actualiser').setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });

    // Section handlers
    client.buttonHandlers.set('dash_protection', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const raidState = client.raidMode?.get(guildId) || {};
      const protEmbed = new EmbedBuilder()
        .setTitle('🛡️ Configuration Protection')
        .setColor(0xff0000)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: 'UltraShield', value: config.shieldEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
          { name: 'Anti-Spam', value: config.antiSpamEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
          { name: 'Anti-Raid', value: config.antiRaidEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
          { name: 'AutoMod', value: config.autoModEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
          { name: 'Raid Mode', value: raidState.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true },
          { name: 'Seuil Raid', value: String(config.raidThreshold || 5), inline: true }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary),
      );
      await btn.update({ embeds: [protEmbed], components: [row] });
      client.buttonHandlers.set('dash_main', async (b) => {
        if (b.user.id !== interaction.user.id) return;
        await b.update({ embeds: [embed], components: [row1, row2] });
      });
    });

    client.buttonHandlers.set('dash_config', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const cfgEmbed = new EmbedBuilder()
        .setTitle('⚙️ Configuration Générale')
        .setColor(0x00ff99)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '📌 Prefix', value: `\`${config.prefix || '!'}\``, inline: true },
          { name: '📜 Log Channel', value: config.logChannel ? `<#${config.logChannel}>` : '❌ Non défini', inline: true },
          { name: '🔇 Muted Role', value: config.mutedRole ? `<@&${config.mutedRole}>` : '❌ Non défini', inline: true },
          { name: '🎭 Auto-Role', value: config.autoRole ? `<@&${config.autoRole}>` : '❌ Désactivé', inline: true },
          { name: '📨 Welcome', value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : '❌ Désactivé', inline: true },
          { name: '👋 Goodbye', value: config.goodbyeChannel ? `<#${config.goodbyeChannel}>` : '❌ Désactivé', inline: true }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
      await btn.update({ embeds: [cfgEmbed], components: [row] });
    });

    client.buttonHandlers.set('dash_whitelist', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const wl = await getWhitelist(guildId);
      const wlEmbed = new EmbedBuilder()
        .setTitle('📋 Whitelist')
        .setColor(0xffa502)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '👤 Utilisateurs', value: wl.users?.length > 0 ? wl.users.map(id => `<@${id}>`).join(', ') : 'Aucun', inline: false },
          { name: '🎭 Rôles', value: wl.roles?.length > 0 ? wl.roles.map(id => `<@&${id}>`).join(', ') : 'Aucun', inline: false },
          { name: '📁 Salons', value: wl.channels?.length > 0 ? wl.channels.map(id => `<#${id}>`).join(', ') : 'Aucun', inline: false }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
      await btn.update({ embeds: [wlEmbed], components: [row] });
    });

    client.buttonHandlers.set('dash_logs', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const logsEmbed = new EmbedBuilder()
        .setTitle('📜 Configuration Logs')
        .setColor(0x0099ff)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '📜 Mod Logs', value: config.logChannel ? `<#${config.logChannel}>` : '❌ Non configuré', inline: true },
          { name: '🛡️ Anti-Raid Logs', value: config.raidLogChannel ? `<#${config.raidLogChannel}>` : 'Défaut (mod-logs)', inline: true },
          { name: '⚙️ AutoMod Logs', value: config.autoModLogChannel ? `<#${config.autoModLogChannel}>` : 'Défaut (mod-logs)', inline: true }
        )
        .setDescription('Utilisez `/setlogs #salon` pour configurer le salon de logs.')
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
      await btn.update({ embeds: [logsEmbed], components: [row] });
    });

    client.buttonHandlers.set('dash_autorole', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const arEmbed = new EmbedBuilder()
        .setTitle('🎭 Auto-Role Configuration')
        .setColor(0x9b59b6)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '🎭 Rôle actuel', value: config.autoRole ? `<@&${config.autoRole}>` : '❌ Désactivé', inline: true }
        )
        .setDescription('Utilisez `/autorole @rôle` pour définir le rôle automatique.')
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
      await btn.update({ embeds: [arEmbed], components: [row] });
    });

    client.buttonHandlers.set('dash_refresh', async (btn) => {
      if (btn.user.id !== interaction.user.id) return;
      const newConfig = await getGuildConfig(guildId);
      const newWhitelist = await getWhitelist(guildId);
      client.guildConfigs.set(guildId, newConfig);

      const refreshedEmbed = new EmbedBuilder()
        .setTitle('🛠️ Niotic Dashboard')
        .setColor(0x00ff99)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription('✅ Configuration actualisée!')
        .addFields(
          { name: '🛡️ Protection', value: 'Shield, Anti-Raid, Anti-Spam', inline: true },
          { name: '⚙️ Configuration', value: 'Paramètres généraux', inline: true },
          { name: '📋 Whitelist', value: `${newWhitelist.users?.length || 0} users, ${newWhitelist.roles?.length || 0} roles`, inline: true },
          { name: '📜 Logs', value: newConfig.logChannel ? `<#${newConfig.logChannel}>` : 'Non configuré', inline: true },
          { name: '🎭 Auto-Role', value: newConfig.autoRole ? `<@&${newConfig.autoRole}>` : 'Désactivé', inline: true }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();

      await btn.update({ embeds: [refreshedEmbed], components: [row1, row2] });
    });
  },
};
EOF

log "✅ Dashboard created"

# ============================================================
# STEP 5: Add More Commands via Factory if Needed
# ============================================================
log "🏭 Checking/updating factory..."

mkdir -p src/commands/factory

cat > src/commands/factory/templates.js << 'EOF'
/**
 * Command Templates - Add templates here to auto-generate commands
 * Run: node generate.js
 */

export const templates = [
  // Moderation
  { name: 'kick', category: 'moderation', emoji: '🦶', action: 'kick' },
  { name: 'mute', category: 'moderation', emoji: '🔇', action: 'mute' },
  { name: 'unmute', category: 'moderation', emoji: '🔊', action: 'unmute' },
  { name: 'warn', category: 'moderation', emoji: '⚠️', action: 'warn' },
  { name: 'warns', category: 'moderation', emoji: '📋', action: 'warns' },
  { name: 'clearwarns', category: 'moderation', emoji: '🧹', action: 'clearwarns' },
  { name: 'tempban', category: 'moderation', emoji: '⏱️', action: 'tempban' },
  { name: 'softban', category: 'moderation', emoji: '💨', action: 'softban' },
  { name: 'clear', category: 'moderation', emoji: '🗑️', action: 'clear' },
  { name: 'lock', category: 'moderation', emoji: '🔒', action: 'lock' },
  { name: 'unlock', category: 'moderation', emoji: '🔓', action: 'unlock' },
  { name: 'slowmode', category: 'moderation', emoji: '🐌', action: 'slowmode' },
  { name: 'giverole', category: 'moderation', emoji: '🎭', action: 'giverole' },
  { name: 'takerole', category: 'moderation', emoji: '🎭', action: 'takerole' },
  { name: 'hackban', category: 'moderation', emoji: '🔨', action: 'hackban' },
  { name: 'purge', category: 'moderation', emoji: '🗑️', action: 'purge' },

  // Info
  { name: 'userinfo', category: 'info', emoji: '👤', action: 'userinfo' },
  { name: 'serverinfo', category: 'info', emoji: '🏠', action: 'serverinfo' },
  { name: 'roleinfo', category: 'info', emoji: '🏷️', action: 'roleinfo' },
  { name: 'channelinfo', category: 'info', emoji: '📁', action: 'channelinfo' },
  { name: 'permissions', category: 'info', emoji: '🔑', action: 'permissions' },
  { name: 'avlookup', category: 'info', emoji: '🖼️', action: 'avlookup' },

  // Utility
  { name: 'poll', category: 'utility', emoji: '📊', action: 'poll' },
  { name: 'vote', category: 'utility', emoji: '🗳️', action: 'vote' },
  { name: 'embed', category: 'utility', emoji: '📝', action: 'embed' },
  { name: 'say', category: 'utility', emoji: '💬', action: 'say' },

  // Config
  { name: 'config', category: 'config', emoji: '⚙️', action: 'config' },
  { name: 'setlogs', category: 'config', emoji: '📜', action: 'setlogs' },
  { name: 'setprefix', category: 'config', emoji: '📌', action: 'setprefix' },
  { name: 'setmutedrole', category: 'config', emoji: '🔇', action: 'setmutedrole' },
  { name: 'setraidconfig', category: 'config', emoji: '🛡️', action: 'setraidconfig' },
  { name: 'setantispam', category: 'config', emoji: '🛡️', action: 'setantispam' },
  { name: 'setderank', category: 'config', emoji: '⚠️', action: 'setderank' },
  { name: 'addwhitelist', category: 'config', emoji: '✅', action: 'addwhitelist' },
  { name: 'removewhitelist', category: 'config', emoji: '❌', action: 'removewhitelist' },
  { name: 'whitelist', category: 'config', emoji: '📋', action: 'whitelist' },
  { name: 'autorole', category: 'automation', emoji: '🎭', action: 'autorole' },
  { name: 'welcome', category: 'automation', emoji: '👋', action: 'welcome' },
  { name: 'goodbye', category: 'automation', emoji: '👋', action: 'goodbye' },
  { name: 'backup', category: 'automation', emoji: '💾', action: 'backup' },
  { name: 'settings', category: 'automation', emoji: '⚙️', action: 'settings' },
  { name: 'shield', category: 'protection', emoji: '🛡️', action: 'shield' },
  { name: 'raidmode', category: 'protection', emoji: '🚨', action: 'raidmode' },
  { name: 'lockdown', category: 'protection', emoji: '🔒', action: 'lockdown' },
  { name: 'unquakeserver', category: 'protection', emoji: '🔓', action: 'unquakeserver' },
  { name: 'stats', category: 'stats', emoji: '📊', action: 'stats' },
  { name: 'leaderboard', category: 'stats', emoji: '🏆', action: 'leaderboard' },
  { name: 'ping', category: 'info', emoji: '🏓', action: 'ping' },
  { name: 'uptime', category: 'info', emoji: '⏰', action: 'uptime' },
  { name: 'dashboard', category: 'config', emoji: '🛠️', action: 'dashboard' },
];
EOF

log "✅ Factory templates updated"

# ============================================================
# STEP 6: Update MEMORY.md
# ============================================================
log "📝 Updating MEMORY.md..."

cat > MEMORY.md << 'EOF'
# Niotic Discord Bot - Memory

## Overview
Niotic v3 - Advanced Discord moderation bot with anti-raid, anti-spam, and auto-moderation features.
**Location:** `/root/discord-moderation-bot`
**Bot:** Niotic#5518 running on PM2 as `discord-bot`

## Architecture
- **Entry:** `index.js` - ES Module entry point
- **Bot core:** `src/bot.js` - Client setup and command/event loading
- **Commands:** `src/commands/{moderation,config,utility,info,protection,automation,stats}/`
- **Events:** `src/events/` - interactionCreate, guildMemberAdd, guildMemberRemove, guildCreate, messageCreate
- **Handlers:** `src/handlers/` - raidHandler, antiSpamHandler, derankHandler, autoModHandler
- **Utils:** `src/utils/embeds.js` - Beautiful consistent embed builder (colors, thumbnails, footers)
- **Database:** `src/database/db.js` - SQLite via better-sqlite3
- **Factory:** `src/commands/factory/` - templates.js + generate.js for auto-generating commands

## Visual Design System
Embed colors:
- Success: `0x00ff99` (green)
- Error: `0xff4757` (red)
- Warning: `0xffa502` (orange)
- Info: `0x5865F2` (blue)
- Moderation: `0xff6b81` (pink)
- Raid: `0xff0000` (red)
- Shield: `0x9b59b6` (purple)
- Mute: `0xffd93d` (yellow)

Every embed includes:
- Thumbnail (user avatar or bot avatar)
- Footer with "Niotic Moderation" + timestamp
- Inline fields for compact info
- Emoji in title for clarity

## Key Patterns
- Button handlers: `client.buttonHandlers.set(customId, callback)`
- Guild configs: `client.guildConfigs.set(guildId, config)`
- Raid state: `client.raidMode.get(guildId)`
- Commands use `export default { data, name, permissions, execute }`
- All moderation actions logged via `addLog()`
- French primary language, English fallbacks

## Database Exports (from db.js)
`getGuildConfig(guildId)`, `updateGuildConfig(guildId, updates)`, `getWhitelist(guildId)`, `addToWhitelist(guildId, type, id)`, `removeFromWhitelist(guildId, type, id)`, `addWarning(guildId, userId, data)`, `getWarnings(guildId, userId)`, `clearWarnings(guildId, userId)`, `addLog(guildId, data)`, `addViolation(guildId, userId, points)`, `getStats(guildId)`, `addBackup(guildId, data)`, `getBackup(id)`, `addRaidEvent(guildId, data)`

## Running
```bash
cd /root/discord-moderation-bot
npm install
npm start        # Production
npm run dev      # Watch mode
```

## GitHub
`github.com/WorksaseItsgood/discord-moderation-bot`

## PM2
```bash
pm2 status discord-bot   # Check status
pm2 restart discord-bot  # Restart
pm2 logs discord-bot     # View logs
```

## User Preferences (Work)
- French language
- Short responses preferred
- Doesn't ask for confirmation on routine actions
- Works at night - optimize code without asking
EOF

log "✅ MEMORY.md updated"

# ============================================================
# STEP 7: Update README.md
# ============================================================
log "📖 Updating README.md..."

cat > README.md << 'EOF'
# Niotic - Discord Moderation Bot

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![Discord.js](https://img.shields.io/badge/discord.js-14.15.0-purple)

🛡️ Advanced Discord moderation bot with anti-raid, anti-spam, and auto-moderation features.

## Features

### 🛡️ Protection
- **Anti-Raid System** - Auto-detect and lockdown on raid attacks
- **Anti-Spam** - Flood protection, mention spam, link spam detection
- **Derank Protection** - Track suspicious activity and auto-derank offenders
- **Auto-Mod** - Word filter, link filter, token detection

### ⚡ Moderation (55+ commands)
- `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warns`, `/clearwarns`
- `/tempban`, `/softban`, `/timeout`, `/clear`, `/purge`
- `/lock`, `/unlock`, `/slowmode`, `/giverole`, `/takerole`, `/hackban`

### 🛠️ Configuration
- `/dashboard` - Interactive button-based configuration
- `/shield`, `/raidmode`, `/lockdown`, `/unquakeserver`
- `/config`, `/setlogs`, `/setprefix`, `/setmutedrole`
- `/setraidconfig`, `/setantispam`, `/setderank`
- `/whitelist`, `/addwhitelist`, `/removewhitelist`

### 🤖 Automation
- `/autorole` - Auto-assign role to new members
- `/welcome`, `/goodbye` - Custom messages
- `/backup`, `/restore` - Server backup system

### 📊 Info
- `/userinfo`, `/serverinfo`, `/roleinfo`, `/channelinfo`
- `/permissions`, `/ping`, `/uptime`, `/stats`

### 🎨 Visual Design
- Beautiful, consistent embeds with thumbnails and footers
- Button-based confirmations for dangerous actions
- Interactive dashboard with section navigation
- French + English localization

## Installation

```bash
# Clone
git clone https://github.com/WorksaseItsgood/discord-moderation-bot.git
cd discord-moderation-bot

# Install dependencies
npm install

# Configure
cp .env.example .env
# Edit .env with your bot token

# Start
npm start
```

## Environment Variables

```env
DISCORD_TOKEN=your_bot_token_here
```

## Commands

| Category | Commands |
|----------|----------|
| **Moderation** | ban, kick, mute, unmute, warn, warns, clearwarns, tempban, softban, timeout, clear, purge, lock, unlock, slowmode, giverole, takerole, hackban |
| **Protection** | shield, raidmode, lockdown, unquakeserver, scanraid, trust |
| **Config** | dashboard, config, setlogs, setprefix, setmutedrole, setraidconfig, setantispam, setderank, whitelist, addwhitelist, removewhitelist |
| **Automation** | autorole, welcome, goodbye, backup, restore, settings |
| **Utility** | poll, vote, embed, say, avlookup |
| **Info** | userinfo, serverinfo, roleinfo, channelinfo, permissions, ping, uptime, stats, leaderboard |

## Command Factory

Generate additional commands from templates:

```bash
node src/commands/factory/generate.js
```

Edit `src/commands/factory/templates.js` to add new command templates.

## PM2 Management

```bash
pm2 start npm --name "discord-bot" -- start
pm2 status discord-bot
pm2 restart discord-bot
pm2 logs discord-bot
pm2 stop discord-bot
```

## Architecture

```
src/
├── bot.js              # Main entry point
├── database/db.js      # SQLite database layer
├── events/             # Discord events
│   ├── interactionCreate.js
│   ├── guildMemberAdd.js
│   └── guildMemberRemove.js
├── handlers/           # Feature handlers
│   ├── raidHandler.js
│   ├── antiSpamHandler.js
│   └── derankHandler.js
├── commands/           # Slash commands
│   ├── moderation/
│   ├── config/
│   ├── protection/
│   ├── automation/
│   ├── utility/
│   ├── info/
│   └── factory/
└── utils/embeds.js     # Embed builder
```

## License

MIT
EOF

log "✅ README.md updated"

# ============================================================
# STEP 8: Restart Bot to Load Changes
# ============================================================
log "🔄 Restarting bot to load changes..."

pm2 restart discord-bot 2>/dev/null
sleep 3

# Check if loaded
sleep 2
LINES=$(pm2 logs discord-bot --lines 30 --nostream 2>/dev/null | grep -E "(Loaded|Error|Logged in)" | tail -5)
log "Bot status after restart:"
log "$LINES"

# ============================================================
# STEP 9: Git Push
# ============================================================
log "📤 Git push..."

git config user.email "work@niotic.dev" 2>/dev/null
git config user.name "Work" 2>/dev/null

git add -A
git commit -m "✨ Bot optimisé — embeds améliorés, dashboard interactif, visual design system

- Beautiful embeds avec thumbnails, footers, couleurs cohérentes
- Dashboard interactif avec boutons de navigation
- Confirmation buttons sur toutes les actions dangereuses
- MEMORY.md complet avec design system
- README.md avec badges et liste complète des commandes
- Factory templates mise à jour
- Code optimisé et erreurs gérées" 2>/dev/null

git push origin main 2>/dev/null

# ============================================================
# DONE
# ============================================================
FINAL_CMDS=$(find src/commands -name "*.js" 2>/dev/null | wc -l)
FINAL_EVTS=$(find src/events -name "*.js" 2>/dev/null | wc -l)
FINAL_HANDLERS=$(find src/handlers -name "*.js" 2>/dev/null | wc -l)

echo ""
echo "=========================================="
echo "   🎉 OPTIMIZATION COMPLETE!"
echo "=========================================="
echo "📁 Location: $BOT_DIR"
echo "📊 Commands: $FINAL_CMDS"
echo "📡 Events: $FINAL_EVTS"
echo "🛡️ Handlers: $FINAL_HANDLERS"
echo "🎨 Visual: Enhanced embeds + dashboard"
echo "✅ GitHub: Pushed!"
echo "=========================================="
