/**
 * /setlogs - Configure the logging system with 3 surveillance levels
 * Normal: #mod-logs, #server-logs
 * Moyen: #mod-logs, #server-logs, #message-logs, #raid-logs
 * Extrême: #mod-logs, #server-logs, #message-logs, #raid-logs, #voice-logs, #role-logs
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } from 'discord.js';
import { updateGuildConfig, getGuildConfig } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

const CHANNEL_MAP = {
  normal: ['mod-logs', 'server-logs'],
  medium: ['mod-logs', 'server-logs', 'message-logs', 'raid-logs'],
  extreme: ['mod-logs', 'server-logs', 'message-logs', 'raid-logs', 'voice-logs', 'role-logs'],
};

const CHANNEL_CONFIG = {
  'mod-logs': 'modLogChannel',
  'server-logs': 'serverLogChannel',
  'message-logs': 'messageLogChannel',
  'raid-logs': 'raidLogChannel',
  'voice-logs': 'voiceLogChannel',
  'role-logs': 'roleLogChannel',
};

const CHANNEL_PURPOSE = {
  'mod-logs': 'Bans, Kicks, Mutes, Warns',
  'server-logs': 'Joins, Leaves, Server updates',
  'message-logs': 'Message edits, deletions',
  'raid-logs': 'Raid events, protections',
  'voice-logs': 'Voice joins, leaves, moves',
  'role-logs': 'Role changes, assignments',
};

export default {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setNameLocalizations({ fr: 'setlogs', 'en-US': 'setlogs' })
    .setDescription('Configure the logging system with 3 surveillance levels')
    .setDescriptionLocalizations({ fr: 'Configurer le système de logs avec 3 niveaux', 'en-US': 'Configure the logging system with 3 surveillance levels' })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  name: 'setlogs',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageChannels] },

  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const guildId = guild.id;
      const userId = interaction.user.id;

      await interaction.deferReply({ ephemeral: true });

      const config = getGuildConfig(guildId);
      const currentLevel = config.logLevel || 'none';

      const embed = new EmbedBuilder()
        .setTitle('📋 Configuration des Logs')
        .setDescription('Sélectionnez le niveau de surveillance souhaité.')
        .setColor(0x5865F2)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '🟢 Normal', value: '2 salons: #mod-logs, #server-logs', inline: false },
          { name: '🟡 Moyen', value: '4 salons: +message-logs, +raid-logs', inline: false },
          { name: '🔴 Extrême', value: '6 salons: +voice-logs, +role-logs', inline: false }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('setlogs_normal').setLabel('🟢 Normal').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('setlogs_medium').setLabel('🟡 Moyen').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('setlogs_extreme').setLabel('🔴 Extrême').setStyle(ButtonStyle.Danger),
      );

      const reply = await interaction.editReply({ embeds: [embed], components: [row] });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        const level = btn.customId.replace('setlogs_', '');
        if (!['normal', 'medium', 'extreme'].includes(level)) return;

        await btn.deferUpdate();

        const createdChannels = [];
        const existingChannels = [];
        const everyoneRole = guild.roles.everyone;
        const botMember = guild.members.cache.get(client.user.id) || await guild.members.fetch(client.user.id);

        for (const channelName of CHANNEL_MAP[level]) {
          let existing = guild.channels.cache.find((c) => c.name === channelName);

          if (existing) {
            existingChannels.push(existing);
            const field = CHANNEL_CONFIG[channelName];
            if (field) await updateGuildConfig(guildId, { [field]: existing.id });
          } else {
            try {
              const newChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                  { id: everyoneRole.id, deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                  { id: botMember.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'] },
                ],
                topic: `Niotic ${level.charAt(0).toUpperCase() + level.slice(1)} Log — Ne pas supprimer`,
              });
              createdChannels.push(newChannel);
              const field = CHANNEL_CONFIG[channelName];
              if (field) await updateGuildConfig(guildId, { [field]: newChannel.id });

              // Send welcome message to new channel
              const purpose = CHANNEL_PURPOSE[channelName] || 'General logging';
              await newChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`📋 ${newChannel.name}`)
                    .setColor(0x5865F2)
                    .setDescription(`Ce salon est configuré pour les logs de niveau **${level}**.`)
                    .addFields({ name: '🎯 Type', value: purpose, inline: true })
                    .setFooter({ text: 'Niotic Moderation' })
                    .setTimestamp(),
                ],
              }).catch(() => {});
            } catch (err) {
              console.error(`[SetLogs] Failed to create ${channelName}:`, err.message);
            }
          }
        }

        await updateGuildConfig(guildId, { logLevel: level });

        const emoji = level === 'normal' ? '🟢' : level === 'medium' ? '🟡' : '🔴';
        const color = level === 'normal' ? 0x00ff99 : level === 'medium' ? 0xffa502 : 0xff0000;

        const successEmbed = new EmbedBuilder()
          .setTitle(`${emoji} Logs configurés — Niveau ${level.charAt(0).toUpperCase() + level.slice(1)}`)
          .setColor(color)
          .setThumbnail(guild.iconURL() || client.user.displayAvatarURL())
          .setDescription(`Le système de logs a été configuré avec le niveau **${level}**.`)
          .addFields({
            name: '📁 Salons créés',
            value: createdChannels.length > 0 ? createdChannels.map((c) => c.toString()).join('\n') : 'Aucun (existant utilisé)',
            inline: false,
          })
          .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
          .setTimestamp();

        if (existingChannels.length > 0) {
          successEmbed.addFields({
            name: '✅ Salons existants utilisés',
            value: existingChannels.map((c) => c.toString()).join('\n'),
            inline: false,
          });
        }

        await btn.editReply({ embeds: [successEmbed], components: [] });

        // Log the configuration change
        try {
          await logModeration(guild, 'config', {
            target: { tag: 'Log System', id: 'system' },
            moderator: btn.user,
            reason: `Log level changed to ${level}`,
            extra: `Created: ${createdChannels.length}, Existing: ${existingChannels.length}`,
          });
        } catch (e) {
          console.error('[SetLogs] Failed to log:', e);
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error('[SetLogs] Error:', error);
      try {
        await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
      } catch {}
    }
  },
};
