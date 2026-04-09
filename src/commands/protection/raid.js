/**
 * /raid - Anti-Raid configuration panel
 * Full control over raid protection settings
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { getGuildConfig, updateGuildConfig, getRaidActionLog } from '../../database/db.js';
import { enableRaidMode, disableRaidMode, getRaidStatus } from '../../handlers/raidHandler.js';
import { logRaid } from '../../utils/logManager.js';

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
      const config = getGuildConfig(guildId);
      const raidState = getRaidStatus(guildId, client);

      // Get current join speed if available
      const joinData = client.joinTracker?.get(guildId) || {};
      const recentJoins = joinData.recentJoins || [];
      const joinSpeed = recentJoins.length > 0 ? `${recentJoins.length} joins détectés` : 'N/A';

      // Create main embed with shield visual
      const statusColor = raidState.active ? 0xff0000 : 0x00ff99;
      const statusEmoji = raidState.active ? '🔒' : '🟢';
      const statusText = raidState.active ? 'ACTIF' : 'Inactif';

      const embed = new EmbedBuilder()
        .setTitle('🛡️ Panneau de Configuration Anti-Raid')
        .setColor(0x9b59b6)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '🔒 Statut Raid Mode', value: `${statusEmoji} ${statusText}`, inline: true },
          { name: '📊 Seuil actuel', value: `${config.raidThreshold || 5} joins/10s`, inline: true },
          { name: '⏱️ Durée de lock', value: `${config.raidLockDuration || 15} minutes`, inline: true },
          { name: '⚡ Vitesse de join', value: joinSpeed, inline: true },
          { name: '🎯 Type', value: raidState.type || 'N/A', inline: true },
          { name: '👤 Déclenché par', value: raidState.triggeredBy || 'N/A', inline: true }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      // Create action buttons
      const enableBtn = new ButtonBuilder()
        .setCustomId('raid_enable')
        .setLabel('🔒 Activer Raid Mode')
        .setStyle(ButtonStyle.Danger);

      const disableBtn = new ButtonBuilder()
        .setCustomId('raid_disable')
        .setLabel('🟢 Désactiver Raid Mode')
        .setStyle(ButtonStyle.Success);

      const thresholdBtn = new ButtonBuilder()
        .setCustomId('raid_threshold')
        .setLabel('📊 Changer Seuil')
        .setStyle(ButtonStyle.Primary);

      const durationBtn = new ButtonBuilder()
        .setCustomId('raid_duration')
        .setLabel('⏱️ Changer Durée Lock')
        .setStyle(ButtonStyle.Primary);

      const viewLogBtn = new ButtonBuilder()
        .setCustomId('raid_viewlog')
        .setLabel('📋 Voir Logs')
        .setStyle(ButtonStyle.Secondary);

      const derankBtn = new ButtonBuilder()
        .setCustomId('raid_derank')
        .setLabel('📉 Emergency Derank')
        .setStyle(ButtonStyle.Danger);

      const row1 = new ActionRowBuilder().addComponents(enableBtn, disableBtn);
      const row2 = new ActionRowBuilder().addComponents(thresholdBtn, durationBtn, viewLogBtn);
      const row3 = new ActionRowBuilder().addComponents(derankBtn);

      await interaction.reply({ embeds: [embed], components: [row1, row2, row3], ephemeral: true });

      // Set up button handlers
      client.buttonHandlers.set('raid_enable', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        try {
          const count = await enableRaidMode(guild, btn.user.tag, client);
          await logRaid(guild, 'raidStart', {
            triggeredBy: btn.user.tag,
            reason: 'Manually enabled',
            count,
          });
          await btn.update({ content: `✅ Raid Mode activé! ${count} salons verrouillés.`, embeds: [], components: [] });
        } catch (error) {
          await btn.update({ content: `❌ Erreur: ${error.message}`, embeds: [], components: [] });
        }
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      client.buttonHandlers.set('raid_disable', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        try {
          await disableRaidMode(guild, client);
          await logRaid(guild, 'raidEnd', {
            triggeredBy: btn.user.tag,
            reason: 'Manually disabled',
          });
          await btn.update({ content: '✅ Raid Mode désactivé!', embeds: [], components: [] });
        } catch (error) {
          await btn.update({ content: `❌ Erreur: ${error.message}`, embeds: [], components: [] });
        }
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      client.buttonHandlers.set('raid_threshold', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        await btn.update({ content: null, embeds: [createThresholdSelectEmbed()], components: [createThresholdRow()] });
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      client.buttonHandlers.set('raid_duration', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        await btn.update({ content: null, embeds: [createDurationSelectEmbed()], components: [createDurationRow()] });
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      client.buttonHandlers.set('raid_viewlog', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        try {
          const logs = getRaidActionLog(guildId, 10);
          const logEmbed = new EmbedBuilder()
            .setTitle('📋 Historique des Actions Anti-Raid')
            .setColor(0x9b59b6)
            .setTimestamp()
            .setFooter({ text: 'Niotic Moderation' });

          if (logs.length === 0) {
            logEmbed.setDescription('Aucun log de raid disponible.');
          } else {
            const logText = logs.map(log => {
              const time = new Date(log.timestamp * 1000).toLocaleString('fr-FR');
              return `**${log.type}** - ${log.triggeredBy} - ${time}`;
            }).join('\n');
            logEmbed.setDescription(logText.substring(0, 2048));
          }

          await btn.update({ content: null, embeds: [logEmbed], components: [] });
        } catch (error) {
          await btn.update({ content: `❌ Erreur: ${error.message}`, embeds: [], components: [] });
        }
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      client.buttonHandlers.set('raid_derank', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        try {
          await btn.update({ content: '⚠️ Derank en cours...', embeds: [], components: [] });
          
          const members = await guild.members.fetch();
          let deranked = 0;
          
          for (const member of members.values()) {
            if (member.roles.highest.position >= guild.me.roles.highest.position) continue;
            if (member.user.bot) continue;
            if (member.permissions.has(PermissionFlagsBits.Administrator)) continue;
            
            try {
              await member.roles.set([], 'Emergency derank triggered');
              deranked++;
            } catch {}
          }
          
          await logRaid(guild, 'raidDerank', {
            triggeredBy: btn.user.tag,
            reason: 'Emergency derank',
            count: deranked,
          });
          
          await btn.editReply({ content: `✅ Emergency derank terminé! ${deranked} membres dérankés.`, embeds: [], components: [] });
        } catch (error) {
          await btn.editReply({ content: `❌ Erreur: ${error.message}`, embeds: [], components: [] });
        }
        client.buttonHandlers.delete('raid_enable');
        client.buttonHandlers.delete('raid_disable');
        client.buttonHandlers.delete('raid_threshold');
        client.buttonHandlers.delete('raid_duration');
        client.buttonHandlers.delete('raid_viewlog');
        client.buttonHandlers.delete('raid_derank');
      });

      // Threshold selection handlers
      client.buttonHandlers.set('threshold_5', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidThreshold: 5 });
        client.guildConfigs.set(guildId, { ...config, raidThreshold: 5 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Threshold set to 5' });
        await btn.update({ content: '✅ Seuil défini à 5 joins/10s', embeds: [], components: [] });
      });

      client.buttonHandlers.set('threshold_10', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidThreshold: 10 });
        client.guildConfigs.set(guildId, { ...config, raidThreshold: 10 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Threshold set to 10' });
        await btn.update({ content: '✅ Seuil défini à 10 joins/10s', embeds: [], components: [] });
      });

      client.buttonHandlers.set('threshold_20', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidThreshold: 20 });
        client.guildConfigs.set(guildId, { ...config, raidThreshold: 20 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Threshold set to 20' });
        await btn.update({ content: '✅ Seuil défini à 20 joins/10s', embeds: [], components: [] });
      });

      client.buttonHandlers.set('threshold_50', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidThreshold: 50 });
        client.guildConfigs.set(guildId, { ...config, raidThreshold: 50 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Threshold set to 50' });
        await btn.update({ content: '✅ Seuil défini à 50 joins/10s', embeds: [], components: [] });
      });

      // Duration selection handlers
      client.buttonHandlers.set('duration_5', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidLockDuration: 5 });
        client.guildConfigs.set(guildId, { ...config, raidLockDuration: 5 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Lock duration set to 5 minutes' });
        await btn.update({ content: '✅ Durée de lock définie à 5 minutes', embeds: [], components: [] });
      });

      client.buttonHandlers.set('duration_15', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidLockDuration: 15 });
        client.guildConfigs.set(guildId, { ...config, raidLockDuration: 15 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Lock duration set to 15 minutes' });
        await btn.update({ content: '✅ Durée de lock définie à 15 minutes', embeds: [], components: [] });
      });

      client.buttonHandlers.set('duration_30', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidLockDuration: 30 });
        client.guildConfigs.set(guildId, { ...config, raidLockDuration: 30 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Lock duration set to 30 minutes' });
        await btn.update({ content: '✅ Durée de lock définie à 30 minutes', embeds: [], components: [] });
      });

      client.buttonHandlers.set('duration_60', async (btn) => {
        if (btn.user.id !== interaction.user.id) return;
        await updateGuildConfig(guildId, { raidLockDuration: 60 });
        client.guildConfigs.set(guildId, { ...config, raidLockDuration: 60 });
        await logRaid(guild, 'raidConfig', { triggeredBy: btn.user.tag, reason: 'Lock duration set to 60 minutes' });
        await btn.update({ content: '✅ Durée de lock définie à 60 minutes', embeds: [], components: [] });
      });

    } catch (error) {
      console.error('[Raid] Error:', error);
      try {
        await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
      } catch {}
    }
  },
};

function createThresholdSelectEmbed() {
  return new EmbedBuilder()
    .setTitle('📊 Sélection du Seuil Anti-Raid')
    .setColor(0x5865F2)
    .setDescription('Choisissez le nombre de joins en 10 secondes qui déclenchera le mode raid.')
    .addFields(
      { name: '🔢 Seuil', value: '5 - Très sensible\n10 - Sensible (recommandé)\n20 - Modéré\n50 - Tolérant', inline: false }
    )
    .setFooter({ text: 'Niotic Moderation' })
    .setTimestamp();
}

function createThresholdRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('threshold_5').setLabel('5').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('threshold_10').setLabel('10').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('threshold_20').setLabel('20').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('threshold_50').setLabel('50').setStyle(ButtonStyle.Secondary),
  );
}

function createDurationSelectEmbed() {
  return new EmbedBuilder()
    .setTitle('⏱️ Sélection de la Durée de Lock')
    .setColor(0x5865F2)
    .setDescription('Choisissez la durée de verrouillage des salons lors du mode raid.')
    .addFields(
      { name: '⏱️ Durée', value: '5 min - Rapide\n15 min - Standard (recommandé)\n30 min - Prolongé\n60 min - Maximum', inline: false }
    )
    .setFooter({ text: 'Niotic Moderation' })
    .setTimestamp();
}

function createDurationRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('duration_5').setLabel('5m').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('duration_15').setLabel('15m').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('duration_30').setLabel('30m').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('duration_60').setLabel('1h').setStyle(ButtonStyle.Secondary),
  );
}
