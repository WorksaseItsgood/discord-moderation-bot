/**
 * /setlogs - Configure the logging system with 3 surveillance levels
 * Normal: #mod-logs, #server-logs
 * Moyen: #mod-logs, #server-logs, #message-logs, #raid-logs
 * Extrême: #mod-logs, #server-logs, #message-logs, #raid-logs, #voice-logs, #role-logs
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } from 'discord.js';
import { updateGuildConfig, getGuildConfig } from '../../database/db.js';
import { logModeration, logServer } from '../../utils/logManager.js';

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
      const config = getGuildConfig(guildId);
      
      // Create the level selection embed
      const embed = new EmbedBuilder()
        .setTitle('📋 Configuration des Logs')
        .setDescription('Sélectionnez le niveau de surveillance souhaité en cliquant sur un des boutons ci-dessous.')
        .setColor(0x5865F2)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '🟢 Normal', value: '2 salons: #mod-logs, #server-logs', inline: false },
          { name: '🟡 Moyen', value: '4 salons: +message-logs, +raid-logs', inline: false },
          { name: '🔴 Extrême', value: '6 salons: +voice-logs, +role-logs', inline: false }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      // Create buttons for each level
      const normalBtn = new ButtonBuilder()
        .setCustomId('setlogs_normal')
        .setLabel('🟢 Normal')
        .setStyle(ButtonStyle.Success);

      const mediumBtn = new ButtonBuilder()
        .setCustomId('setlogs_medium')
        .setLabel('🟡 Moyen')
        .setStyle(ButtonStyle.Primary);

      const extremeBtn = new ButtonBuilder()
        .setCustomId('setlogs_extreme')
        .setLabel('🔴 Extrême')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(normalBtn, mediumBtn, extremeBtn);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

      // Set up button handlers
      client.buttonHandlers.set('setlogs_normal', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        await handleLevelSelection(btn, client, 'normal', guild, guildId);
        client.buttonHandlers.delete('setlogs_normal');
        client.buttonHandlers.delete('setlogs_medium');
        client.buttonHandlers.delete('setlogs_extreme');
      });

      client.buttonHandlers.set('setlogs_medium', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        await handleLevelSelection(btn, client, 'medium', guild, guildId);
        client.buttonHandlers.delete('setlogs_normal');
        client.buttonHandlers.delete('setlogs_medium');
        client.buttonHandlers.delete('setlogs_extreme');
      });

      client.buttonHandlers.set('setlogs_extreme', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }
        await handleLevelSelection(btn, client, 'extreme', guild, guildId);
        client.buttonHandlers.delete('setlogs_normal');
        client.buttonHandlers.delete('setlogs_medium');
        client.buttonHandlers.delete('setlogs_extreme');
      });

    } catch (error) {
      console.error('[SetLogs] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};

async function handleLevelSelection(btn, client, level, guild, guildId) {
  try {
    // Update button to show processing
    await btn.update({ content: '⚙️ Configuration en cours...', embeds: [], components: [] });

    const channelMap = {
      normal: ['mod-logs', 'server-logs'],
      medium: ['mod-logs', 'server-logs', 'message-logs', 'raid-logs'],
      extreme: ['mod-logs', 'server-logs', 'message-logs', 'raid-logs', 'voice-logs', 'role-logs'],
    };

    const channelConfigMap = {
      'mod-logs': 'modLogChannel',
      'server-logs': 'serverLogChannel',
      'message-logs': 'messageLogChannel',
      'raid-logs': 'raidLogChannel',
      'voice-logs': 'voiceLogChannel',
      'role-logs': 'roleLogChannel',
    };

    const createdChannels = [];
    const existingChannels = [];
    const everyoneRole = guild.roles.everyone;
    const botMember = guild.members.cache.get(client.user.id);

    for (const channelName of channelMap[level]) {
      let existingChannel = guild.channels.cache.find(c => c.name === channelName);

      if (existingChannel) {
        existingChannels.push(existingChannel);
        // Update config with existing channel
        const configField = channelConfigMap[channelName];
        await updateGuildConfig(guildId, { [configField]: existingChannel.id });
      } else {
        // Create new channel
        try {
          const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: everyoneRole.id,
                deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
              },
              {
                id: botMember.id,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
              },
            ],
            topic: `Niotic ${level.charAt(0).toUpperCase() + level.slice(1)} Log Channel - Ne pas supprimer`,
          });
          createdChannels.push(newChannel);
          
          // Update config
          const configField = channelConfigMap[channelName];
          await updateGuildConfig(guildId, { [configField]: newChannel.id });
        } catch (error) {
          console.error(`[SetLogs] Failed to create channel ${channelName}:`, error);
        }
      }
    }

    // Update the log level in database
    await updateGuildConfig(guildId, { logLevel: level });

    // Update client cache
    let config = client.guildConfigs.get(guildId) || {};
    config.logLevel = level;
    client.guildConfigs.set(guildId, config);

    // Create success embed with details
    const levelEmoji = level === 'normal' ? '🟢' : level === 'medium' ? '🟡' : '🔴';
    const levelColor = level === 'normal' ? 0x00ff99 : level === 'medium' ? 0xffa502 : 0xff0000;

    const successEmbed = new EmbedBuilder()
      .setTitle(`${levelEmoji} Logs configurés - Niveau ${level.charAt(0).toUpperCase() + level.slice(1)}`)
      .setColor(levelColor)
      .setThumbnail(guild.iconURL() || client.user.displayAvatarURL())
      .setDescription(`Le système de logs a été configuré avec le niveau **${level}**.`)
      .addFields(
        { name: '📁 Salons créés', value: createdChannels.length > 0 ? createdChannels.map(c => c.toString()).join('\n') : 'Aucun (existant utilisé)', inline: false }
      )
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
      .setTimestamp();

    if (existingChannels.length > 0) {
      successEmbed.addFields({ name: '✅ Salons existants utilisés', value: existingChannels.map(c => c.toString()).join('\n'), inline: false });
    }

    // Send success message
    await btn.editReply({ content: null, embeds: [successEmbed], components: [] });

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

    // Send a welcome message to each created channel
    for (const channel of createdChannels) {
      try {
        const welcomeEmbed = new EmbedBuilder()
          .setTitle(`📋 ${channel.name} - Log Channel`)
          .setColor(0x5865F2)
          .setDescription(`Ce salon est configuré pour les logs de niveau **${level}**.`)
          .addFields({ name: '🎯 Type', value: getChannelPurpose(channel.name), inline: true })
          .setFooter({ text: 'Niotic Moderation' })
          .setTimestamp();
        await channel.send({ embeds: [welcomeEmbed] }).catch(() => {});
      } catch {}
    }

  } catch (error) {
    console.error('[SetLogs] Handle level selection error:', error);
    await btn.editReply({ content: '❌ Erreur lors de la configuration des logs.', embeds: [], components: [] });
  }
}

function getChannelPurpose(channelName) {
  const purposes = {
    'mod-logs': 'Bans, Kicks, Mutes, Warns',
    'server-logs': 'Joins, Leaves, Server updates',
    'message-logs': 'Message edits, deletions',
    'raid-logs': 'Raid events, protections',
    'voice-logs': 'Voice joins, leaves, moves',
    'role-logs': 'Role changes, assignments',
  };
  return purposes[channelName] || 'General logging';
}
