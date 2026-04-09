/**
 * /raid - Anti-Raid configuration panel
 * Full control over raid protection settings with interactive buttons
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getRaidConfig, updateRaidConfig, updateGuildConfig, getRaidActionLog, addRaidActionLog, trackRaidAction, clearRaidActions } from '../../database/db.js';
import { autoDerankUser } from '../../handlers/raidHandler.js';
import { logRaid, logDerank } from '../../utils/logManager.js';

const COLORS = {
  success: 0x00ff99,
  error: 0xff4757,
  warning: 0xffa502,
  info: 0x5865F2,
  raid: 0xff0000,
  shield: 0x9b59b6,
};

export default {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setNameLocalizations({ fr: 'raid', 'en-US': 'raid' })
    .setDescription('Configure and control anti-raid protection')
    .setDescriptionLocalizations({ fr: 'Configurer et contrôler la protection anti-raid', 'en-US': 'Configure and control anti-raid protection' })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  name: 'raid',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageChannels, 'KickMembers'] },

  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const guildId = guild.id;
      const userId = interaction.user.id;

      await interaction.deferReply({ ephemeral: true });

      const reply = await interaction.editReply({
        content: null,
        embeds: [await buildMainEmbed(guildId, client)],
        components: buildMainButtons(),
      });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        const cid = btn.customId;

        // ===== ANTI-BOT =====
        if (cid === 'raid_antibot') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildAntiBotEmbed(guildId, client)],
            components: buildAntiBotButtons(guildId),
          });
        }
        else if (cid === 'raid_antibot_toggle') {
          await btn.deferUpdate();
          const cfg = getRaidConfig(guildId);
          updateRaidConfig(guildId, { antiBotEnabled: !cfg.antiBotEnabled });
          await addRaidActionLog(guildId, { type: 'config', triggeredBy: btn.user.tag, reason: `Anti-Bot ${!cfg.antiBotEnabled ? 'enabled' : 'disabled'}` });
          await btn.editReply({
            embeds: [await buildAntiBotEmbed(guildId, client)],
            components: buildAntiBotButtons(guildId),
          });
        }
        else if (cid.startsWith('raid_antibot_wl_remove_')) {
          await btn.deferUpdate();
          const userIdToRemove = cid.replace('raid_antibot_wl_remove_', '');
          const cfg = getRaidConfig(guildId);
          const newWhitelist = cfg.antiBotWhitelist.filter(id => id !== userIdToRemove);
          updateRaidConfig(guildId, { antiBotWhitelist: newWhitelist });
          await btn.editReply({
            embeds: [await buildAntiBotEmbed(guildId, client)],
            components: buildAntiBotButtons(guildId),
          });
        }
        else if (cid === 'raid_antibot_wl_add') {
          await btn.deferUpdate();
          const guild = client.guilds.cache.get(guildId);
          if (!guild) {
            await btn.editReply({ content: '❌ Guild not found', embeds: [], components: [] });
            return;
          }
          const members = await guild.members.fetch();
          const options = members.filter(m => !m.user.bot).slice(0, 25).map(m => ({
            label: m.user.tag.substring(0, 100),
            value: `antibot_wl_add_${m.user.id}`,
          }));
          
          if (options.length === 0) {
            await btn.editReply({
              embeds: [buildAntiBotWhitelistAddEmbed()],
              components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('raid_antibot_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary)
              )],
            });
            return;
          }
          
          await btn.editReply({
            embeds: [buildAntiBotWhitelistAddEmbed()],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`select_antibot_wl_add_${guildId}`)
                  .setPlaceholder('Sélectionner un utilisateur...')
                  .addOptions(options)
              ),
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('raid_antibot_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary)
              ),
            ],
          });
        }
        else if (cid === 'raid_antibot_back') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildMainEmbed(guildId, client)],
            components: buildMainButtons(),
          });
        }

        // ===== DETECTION =====
        else if (cid === 'raid_detect') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildDetectionEmbed(guildId, client)],
            components: buildDetectionButtons(guildId),
          });
        }
        else if (cid.startsWith('raid_detect_edit_')) {
          await btn.deferUpdate();
          const rule = cid.replace('raid_detect_edit_', '');
          await btn.editReply({
            embeds: [buildEditRuleEmbed(rule, guildId)],
            components: buildEditRuleButtons(rule, guildId),
          });
        }
        else if (cid.startsWith('raid_detect_set_')) {
          await btn.deferUpdate();
          const parts = cid.split('_');
          const rule = parts[3];
          const value = parseInt(parts[4]);
          await applyRuleValue(guildId, rule, value);
          await btn.editReply({
            embeds: [await buildDetectionEmbed(guildId, client)],
            components: buildDetectionButtons(guildId),
          });
        }
        else if (cid === 'raid_detect_back') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildMainEmbed(guildId, client)],
            components: buildMainButtons(),
          });
        }

        // ===== WHITELIST =====
        else if (cid === 'raid_wl') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildWhitelistEmbed(guildId, client)],
            components: buildWhitelistButtons(guildId),
          });
        }
        else if (cid.startsWith('raid_wl_remove_')) {
          await btn.deferUpdate();
          const userIdToRemove = cid.replace('raid_wl_remove_', '');
          const cfg = getRaidConfig(guildId);
          const newBypass = cfg.whitelistBypass.filter(id => id !== userIdToRemove);
          updateRaidConfig(guildId, { whitelistBypass: newBypass });
          await addRaidActionLog(guildId, { type: 'config', triggeredBy: btn.user.tag, reason: 'Removed from whitelist bypass' });
          await btn.editReply({
            embeds: [await buildWhitelistEmbed(guildId, client)],
            components: buildWhitelistButtons(guildId),
          });
        }
        else if (cid === 'raid_wl_add') {
          await btn.deferUpdate();
          const guild = client.guilds.cache.get(guildId);
          if (!guild) {
            await btn.editReply({ content: '❌ Guild not found', embeds: [], components: [] });
            return;
          }
          const members = await guild.members.fetch();
          const options = members.filter(m => !m.user.bot).slice(0, 25).map(m => ({
            label: m.user.tag.substring(0, 100),
            value: `wl_add_${m.user.id}`,
          }));
          
          if (options.length === 0) {
            await btn.editReply({
              embeds: [buildWhitelistAddUserEmbed()],
              components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('raid_wl_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary)
              )],
            });
            return;
          }
          
          await btn.editReply({
            embeds: [buildWhitelistAddUserEmbed()],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`select_wl_add_${guildId}`)
                  .setPlaceholder('Sélectionner un utilisateur...')
                  .addOptions(options)
              ),
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('raid_wl_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary)
              ),
            ],
          });
        }
        else if (cid === 'raid_wl_back') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildMainEmbed(guildId, client)],
            components: buildMainButtons(),
          });
        }

        // ===== PARAMETERS =====
        else if (cid === 'raid_cfg') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildParamsEmbed(guildId, client)],
            components: buildParamsButtons(guildId),
          });
        }
        else if (cid === 'raid_cfg_derank_toggle') {
          await btn.deferUpdate();
          const cfg = getRaidConfig(guildId);
          updateRaidConfig(guildId, { autoDerankEnabled: !cfg.autoDerankEnabled });
          await btn.editReply({
            embeds: [await buildParamsEmbed(guildId, client)],
            components: buildParamsButtons(guildId),
          });
        }
        else if (cid === 'raid_cfg_dm_toggle') {
          await btn.deferUpdate();
          const cfg = getRaidConfig(guildId);
          updateRaidConfig(guildId, { dmOnDerankEnabled: !cfg.dmOnDerankEnabled });
          await btn.editReply({
            embeds: [await buildParamsEmbed(guildId, client)],
            components: buildParamsButtons(guildId),
          });
        }
        else if (cid.startsWith('raid_cfg_delay_')) {
          await btn.deferUpdate();
          const delay = parseInt(cid.replace('raid_cfg_delay_', ''));
          updateRaidConfig(guildId, { derankDelay: delay });
          await btn.editReply({
            embeds: [await buildParamsEmbed(guildId, client)],
            components: buildParamsButtons(guildId),
          });
        }
        else if (cid === 'raid_cfg_logs') {
          await btn.deferUpdate();
          const logs = getRaidActionLog(guildId, 15);
          const lines = logs.length === 0
            ? 'Aucun log disponible.'
            : logs.map((l) => {
                const t = new Date(l.timestamp * 1000).toLocaleString('fr-FR');
                return `**${l.type}** | ${l.triggered_by} | ${t}`;
              }).join('\n');

          await btn.editReply({
            content: null,
            embeds: [new EmbedBuilder()
              .setTitle('📋 Historique Anti-Raid')
              .setColor(COLORS.shield)
              .setDescription(lines.substring(0, 2048))
              .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
              .setTimestamp()],
            components: [new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('raid_cfg_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary)
            )],
          });
        }
        else if (cid === 'raid_cfg_back') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [await buildMainEmbed(guildId, client)],
            components: buildMainButtons(),
          });
        }

        // ===== SELECT MENU HANDLERS =====
        else if (cid.startsWith('select_wl_add_')) {
          await btn.deferUpdate();
          const targetId = cid.replace(`select_wl_add_${guildId}`, '').replace('wl_add_', '');
          const cfg = getRaidConfig(guildId);
          if (!cfg.whitelistBypass.includes(targetId)) {
            const newBypass = [...cfg.whitelistBypass, targetId];
            updateRaidConfig(guildId, { whitelistBypass: newBypass });
            await addRaidActionLog(guildId, { type: 'config', triggeredBy: btn.user.tag, reason: `Added ${targetId} to whitelist bypass` });
          }
          await btn.editReply({
            embeds: [await buildWhitelistEmbed(guildId, client)],
            components: buildWhitelistButtons(guildId),
          });
        }
        else if (cid.startsWith('select_antibot_wl_add_')) {
          await btn.deferUpdate();
          const targetId = cid.replace(`select_antibot_wl_add_${guildId}`, '').replace('antibot_wl_add_', '');
          const cfg = getRaidConfig(guildId);
          if (!cfg.antiBotWhitelist.includes(targetId)) {
            const newWhitelist = [...cfg.antiBotWhitelist, targetId];
            updateRaidConfig(guildId, { antiBotWhitelist: newWhitelist });
            await addRaidActionLog(guildId, { type: 'config', triggeredBy: btn.user.tag, reason: `Added ${targetId} to anti-bot whitelist` });
          }
          await btn.editReply({
            embeds: [await buildAntiBotEmbed(guildId, client)],
            components: buildAntiBotButtons(guildId),
          });
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error('[Raid] Error:', error);
      try {
        await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
      } catch {}
    }
  },
};

// ============ BUILD HELPERS ============

async function buildMainEmbed(guildId, client) {
  const cfg = getRaidConfig(guildId);
  const isActive = cfg.antiBotEnabled || 
    cfg.channelCreateThreshold < 10 || 
    cfg.spamThreshold < 20;

  return new EmbedBuilder()
    .setTitle('🛡️ Configuration Anti-Raid')
    .setColor(COLORS.shield)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Status', value: isActive ? '🟢 ACTIVE' : '⚪ INACTIVE', inline: true },
      { name: 'Anti-Bot', value: cfg.antiBotEnabled ? '🟢 ON' : '⚪ OFF', inline: true },
      { name: 'Auto-Derank', value: cfg.autoDerankEnabled ? '🟢 ON' : '⚪ OFF', inline: true },
      { name: 'Seuil Channel', value: `${cfg.channelCreateThreshold}/${cfg.channelCreateWindowMinutes}min`, inline: true },
      { name: 'Seuil Spam', value: `${cfg.spamThreshold}/${cfg.spamWindowSeconds}s`, inline: true },
      { name: 'Mass Ban', value: `${cfg.massBanThreshold}/${cfg.massBanWindowMinutes}min`, inline: true },
    )
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildMainButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('raid_antibot').setLabel('🤖 Anti-Bot').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('raid_detect').setLabel('🚨 Détection').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('raid_wl').setLabel('⭐ Whitelist').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('raid_cfg').setLabel('⚙️ Paramètres').setStyle(ButtonStyle.Secondary),
  );
  return [row];
}

// ============ ANTI-BOT ============

async function buildAntiBotEmbed(guildId, client) {
  const cfg = getRaidConfig(guildId);
  const whitelist = cfg.antiBotWhitelist || [];
  let wlUsers = 'Aucun utilisateur';
  if (whitelist.length > 0) {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        const members = await guild.members.fetch();
        wlUsers = whitelist.map(id => {
          const member = members.get(id);
          return member ? `👤 ${member.user.tag}` : `❓ ${id}`;
        }).join('\n');
      }
    } catch {}
  }

  return new EmbedBuilder()
    .setTitle('🤖 Configuration Anti-Bot')
    .setColor(COLORS.info)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Statut', value: cfg.antiBotEnabled ? '🟢 ACTIVÉ' : '⚪ DÉSACTIVÉ', inline: true },
      { name: 'Utilisateurs autorisés', value: whitelist.length > 0 ? String(whitelist.length) : 'Aucun', inline: true },
      { name: 'Whitelist Anti-Bot', value: wlUsers, inline: false },
    )
    .setDescription('Les utilisateurs whitelistés peuvent ajouter des bots sans être dérankés.')
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildAntiBotButtons(guildId) {
  const cfg = getRaidConfig(guildId);
  const wl = cfg.antiBotWhitelist || [];
  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_antibot_toggle')
        .setLabel(cfg.antiBotEnabled ? '🔴 Désactiver' : '🟢 Activer')
        .setStyle(cfg.antiBotEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder().setCustomId('raid_antibot_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary),
    ),
  ];

  if (wl.length > 0) {
    const removeButtons = wl.slice(0, 5).map(id => 
      new ButtonBuilder()
        .setCustomId(`raid_antibot_wl_remove_${id}`)
        .setLabel(`❌ ${id}`)
        .setStyle(ButtonStyle.Danger)
    );
    if (removeButtons.length > 0) {
      rows.push(new ActionRowBuilder().addComponents(...removeButtons));
    }
  }

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('raid_antibot_wl_add').setLabel('➕ Ajouter à la whitelist').setStyle(ButtonStyle.Primary),
  ));

  return rows;
}

function buildAntiBotWhitelistAddEmbed() {
  return new EmbedBuilder()
    .setTitle('➕ Ajouter à la Whitelist Anti-Bot')
    .setColor(COLORS.info)
    .setDescription('Sélectionnez un membre pour l\'ajouter à la whitelist anti-bot.\n\nLes utilisateurs whitelistés peuvent ajouter des bots sans déclencher la protection.')
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildWhitelistAddSelectMenu(guildId) {
  return [new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_antibot_wl_add_${guildId}`)
      .setPlaceholder('Sélectionner un utilisateur...')
      .addOptions([{ label: 'Chargement...', value: 'loading' }]),
  )];
}

// ============ DETECTION ============

async function buildDetectionEmbed(guildId, client) {
  const cfg = getRaidConfig(guildId);
  return new EmbedBuilder()
    .setTitle('🚨 Règles de Détection')
    .setColor(COLORS.error)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: '1️⃣ Channel création', value: `${cfg.channelCreateThreshold} en ${cfg.channelCreateWindowMinutes} min`, inline: false },
      { name: '2️⃣ Channel suppression', value: `${cfg.channelDeleteThreshold} en ${cfg.channelDeleteWindowMinutes} min`, inline: false },
      { name: '3️⃣ Mass bans', value: `${cfg.massBanThreshold} en ${cfg.massBanWindowMinutes} min`, inline: false },
      { name: '4️⃣ Mass kicks', value: `${cfg.massKickThreshold} en ${cfg.massKickWindowMinutes} min`, inline: false },
      { name: '5️⃣ Spam messages', value: `${cfg.spamThreshold} en ${cfg.spamWindowSeconds} sec`, inline: false },
    )
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildDetectionButtons(guildId) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_detect_edit_channel_create').setLabel('✏️ Channel création').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('raid_detect_edit_channel_delete').setLabel('✏️ Channel suppression').setStyle(ButtonStyle.Primary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_detect_edit_mass_ban').setLabel('✏️ Mass bans').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('raid_detect_edit_mass_kick').setLabel('✏️ Mass kicks').setStyle(ButtonStyle.Primary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_detect_edit_spam').setLabel('✏️ Spam').setStyle(ButtonStyle.Primary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_detect_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary),
    ),
  ];
}

function buildEditRuleEmbed(rule, guildId) {
  const cfg = getRaidConfig(guildId);
  const ruleNames = {
    channel_create: 'Channel création',
    channel_delete: 'Channel suppression',
    mass_ban: 'Mass bans',
    mass_kick: 'Mass kicks',
    spam: 'Spam messages',
  };
  const ruleColors = {
    channel_create: { threshold: cfg.channelCreateThreshold, window: cfg.channelCreateWindowMinutes, unit: 'min' },
    channel_delete: { threshold: cfg.channelDeleteThreshold, window: cfg.channelDeleteWindowMinutes, unit: 'min' },
    mass_ban: { threshold: cfg.massBanThreshold, window: cfg.massBanWindowMinutes, unit: 'min' },
    mass_kick: { threshold: cfg.massKickThreshold, window: cfg.massKickWindowMinutes, unit: 'min' },
    spam: { threshold: cfg.spamThreshold, window: cfg.spamWindowSeconds, unit: 'sec' },
  };
  const current = ruleColors[rule];

  return new EmbedBuilder()
    .setTitle(`✏️ Modifier: ${ruleNames[rule] || rule}`)
    .setColor(COLORS.warning)
    .setDescription(`**Valeur actuelle:** ${current.threshold} en ${current.window} ${current.unit}\n\n**Entrez la nouvelle valeur:**`)
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildEditRuleButtons(rule, guildId) {
  const quickValues = rule === 'spam' ? [5, 10, 20, 50] : [5, 10, 20, 50];
  return [
    new ActionRowBuilder().addComponents(
      ...quickValues.map(v => 
        new ButtonBuilder()
          .setCustomId(`raid_detect_set_${rule}_${v}`)
          .setLabel(String(v))
          .setStyle(ButtonStyle.Primary)
      ),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_detect_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary),
    ),
  ];
}

async function applyRuleValue(guildId, rule, value) {
  const fieldMap = {
    channel_create: { threshold: 'channelCreateThreshold', window: 'channelCreateWindowMinutes', guildThreshold: 'raidChannelThreshold', guildWindow: 'raidChannelWindow' },
    channel_delete: { threshold: 'channelDeleteThreshold', window: 'channelDeleteWindowMinutes', guildThreshold: 'raidDeleteThreshold', guildWindow: 'raidDeleteWindow' },
    mass_ban: { threshold: 'massBanThreshold', window: 'massBanWindowMinutes', guildThreshold: 'raidBanThreshold', guildWindow: 'raidBanWindow' },
    mass_kick: { threshold: 'massKickThreshold', window: 'massKickWindowMinutes', guildThreshold: 'raidKickThreshold', guildWindow: 'raidKickWindow' },
    spam: { threshold: 'spamThreshold', window: 'spamWindowSeconds', guildThreshold: 'raidSpamThreshold', guildWindow: 'raidSpamWindow' },
  };

  if (fieldMap[rule]) {
    const mapping = fieldMap[rule];
    // Update raid_config
    updateRaidConfig(guildId, { [mapping.threshold]: value });
    // Also update guild_config for new fields
    updateGuildConfig(guildId, { [mapping.guildThreshold]: value });
    await addRaidActionLog(guildId, { type: 'config', triggeredBy: 'system', reason: `Updated ${rule} threshold to ${value}` });
  }
}

// ============ WHITELIST ============

async function buildWhitelistEmbed(guildId, client) {
  const cfg = getRaidConfig(guildId);
  const bypass = cfg.whitelistBypass || [];
  let bypassUsers = 'Aucun utilisateur';
  if (bypass.length > 0) {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        const members = await guild.members.fetch();
        bypassUsers = bypass.map(id => {
          const member = members.get(id);
          return member ? `👤 ${member.user.tag}` : `❓ ${id}`;
        }).join('\n');
      }
    } catch {}
  }

  return new EmbedBuilder()
    .setTitle('⭐ Whitelist Bypass')
    .setColor(COLORS.success)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Utilisateurs whitelisted', value: bypass.length > 0 ? String(bypass.length) : 'Aucun', inline: true },
      { name: 'Liste', value: bypassUsers, inline: false },
    )
    .setDescription('Ces utilisateurs **bypassent TOUTE** la détection raid.')
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildWhitelistButtons(guildId) {
  const cfg = getRaidConfig(guildId);
  const bypass = cfg.whitelistBypass || [];
  const rows = [];

  if (bypass.length > 0) {
    const removeButtons = bypass.slice(0, 5).map(id => 
      new ButtonBuilder()
        .setCustomId(`raid_wl_remove_${id}`)
        .setLabel(`❌ ${id.substring(0, 8)}`)
        .setStyle(ButtonStyle.Danger)
    );
    rows.push(new ActionRowBuilder().addComponents(...removeButtons));
  }

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('raid_wl_add').setLabel('➕ Ajouter utilisateur').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('raid_wl_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary),
  ));

  return rows;
}

function buildWhitelistAddUserEmbed() {
  return new EmbedBuilder()
    .setTitle('➕ Ajouter à la Whitelist')
    .setColor(COLORS.success)
    .setDescription('Sélectionnez un membre pour l\'ajouter à la whitelist.\n\n⚠️ Ces utilisateurs permettront **d\'ajouter des bots** et **bypassent la détection raid**.')
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

// ============ PARAMETERS ============

async function buildParamsEmbed(guildId, client) {
  const cfg = getRaidConfig(guildId);
  return new EmbedBuilder()
    .setTitle('⚙️ Paramètres Anti-Raid')
    .setColor(COLORS.info)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Auto-Derank', value: cfg.autoDerankEnabled ? '🟢 ACTIVÉ' : '⚪ DÉSACTIVÉ', inline: true },
      { name: 'DM on Derank', value: cfg.dmOnDerankEnabled ? '🟢 ON' : '⚪ OFF', inline: true },
      { name: 'Log Channel', value: cfg.logChannelId || 'Non configuré', inline: true },
    )
    .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();
}

function buildParamsButtons(guildId) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_cfg_derank_toggle').setLabel('🔄 Auto-Derank').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('raid_cfg_dm_toggle').setLabel('🔄 DM on Derank').setStyle(ButtonStyle.Primary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_cfg_logs').setLabel('📋 Voir Logs').setStyle(ButtonStyle.Secondary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('raid_cfg_back').setLabel('← Retour').setStyle(ButtonStyle.Secondary),
    ),
  ];
}

// Select menu for whitelist add
