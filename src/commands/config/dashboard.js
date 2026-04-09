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
    try {
      const guildId = interaction.guild.id;
      const config = client.guildConfigs.get(guildId) || {};
      const whitelist = await getWhitelist(guildId);

      await interaction.deferReply({ ephemeral: true });

      const buildMainEmbed = async () => {
        const freshConfig = client.guildConfigs.get(guildId) || {};
        const freshWhitelist = await getWhitelist(guildId);
        return new EmbedBuilder()
          .setTitle('🛠️ Niotic Dashboard')
          .setColor(0x5865F2)
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription('**Tableau de bord de configuration**\n\nUtilisez les boutons ci-dessous pour naviguer entre les sections.')
          .addFields(
            { name: '🛡️ Protection', value: 'Shield, Anti-Raid, Anti-Spam', inline: true },
            { name: '⚙️ Configuration', value: 'Paramètres généraux', inline: true },
            { name: '📋 Whitelist', value: `${freshWhitelist.users?.length || 0} users, ${freshWhitelist.roles?.length || 0} roles`, inline: true },
            { name: '📜 Logs', value: freshConfig.logChannel ? `<#${freshConfig.logChannel}>` : 'Non configuré', inline: true },
            { name: '🎭 Auto-Role', value: freshConfig.autoRole ? `<@&${freshConfig.autoRole}>` : 'Désactivé', inline: true }
          )
          .setFooter({ text: 'Niotic Moderation' })
          .setTimestamp();
      };

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

      const reply = await interaction.editReply({
        embeds: [await buildMainEmbed()],
        components: [row1, row2],
      });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        await btn.deferUpdate();
        const cid = btn.customId;

        if (cid === 'dash_protection') {
          const raidState = client.raidMode?.get(guildId) || {};
          const freshConfig = client.guildConfigs.get(guildId) || {};
          const protEmbed = new EmbedBuilder()
            .setTitle('🛡️ Configuration Protection')
            .setColor(0xff0000)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: 'UltraShield', value: freshConfig.shieldEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
              { name: 'Anti-Spam', value: freshConfig.antiSpamEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
              { name: 'Anti-Raid', value: freshConfig.antiRaidEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
              { name: 'AutoMod', value: freshConfig.autoModEnabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true },
              { name: 'Raid Mode', value: raidState.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true },
              { name: 'Seuil Raid', value: String(freshConfig.raidThreshold || 5), inline: true }
            )
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp();

          const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary),
          );
          await btn.update({ embeds: [protEmbed], components: [backRow] });
        }

        else if (cid === 'dash_main') {
          await btn.update({ embeds: [await buildMainEmbed()], components: [row1, row2] });
        }

        else if (cid === 'dash_config') {
          const freshConfig = client.guildConfigs.get(guildId) || {};
          const cfgEmbed = new EmbedBuilder()
            .setTitle('⚙️ Configuration Générale')
            .setColor(0x00ff99)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: '📌 Prefix', value: `\`${freshConfig.prefix || '!'}\``, inline: true },
              { name: '📜 Log Channel', value: freshConfig.logChannel ? `<#${freshConfig.logChannel}>` : '❌ Non défini', inline: true },
              { name: '🔇 Muted Role', value: freshConfig.mutedRole ? `<@&${freshConfig.mutedRole}>` : '❌ Non défini', inline: true },
              { name: '🎭 Auto-Role', value: freshConfig.autoRole ? `<@&${freshConfig.autoRole}>` : '❌ Désactivé', inline: true },
              { name: '📨 Welcome', value: freshConfig.welcomeChannel ? `<#${freshConfig.welcomeChannel}>` : '❌ Désactivé', inline: true },
              { name: '👋 Goodbye', value: freshConfig.goodbyeChannel ? `<#${freshConfig.goodbyeChannel}>` : '❌ Désactivé', inline: true }
            )
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp();

          const backRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
          await btn.update({ embeds: [cfgEmbed], components: [backRow] });
        }

        else if (cid === 'dash_whitelist') {
          const freshWhitelist = await getWhitelist(guildId);
          const wlEmbed = new EmbedBuilder()
            .setTitle('📋 Whitelist')
            .setColor(0xffa502)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: '👤 Utilisateurs', value: freshWhitelist.users?.length > 0 ? freshWhitelist.users.map(id => `<@${id}>`).join(', ') : 'Aucun', inline: false },
              { name: '🎭 Rôles', value: freshWhitelist.roles?.length > 0 ? freshWhitelist.roles.map(id => `<@&${id}>`).join(', ') : 'Aucun', inline: false },
              { name: '📁 Salons', value: freshWhitelist.channels?.length > 0 ? freshWhitelist.channels.map(id => `<#${id}>`).join(', ') : 'Aucun', inline: false }
            )
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp();

          const backRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
          await btn.update({ embeds: [wlEmbed], components: [backRow] });
        }

        else if (cid === 'dash_logs') {
          const freshConfig = client.guildConfigs.get(guildId) || {};
          const logsEmbed = new EmbedBuilder()
            .setTitle('📜 Configuration Logs')
            .setColor(0x0099ff)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: '📜 Mod Logs', value: freshConfig.logChannel ? `<#${freshConfig.logChannel}>` : '❌ Non configuré', inline: true },
              { name: '🛡️ Anti-Raid Logs', value: freshConfig.raidLogChannel ? `<#${freshConfig.raidLogChannel}>` : 'Défaut (mod-logs)', inline: true },
              { name: '⚙️ AutoMod Logs', value: freshConfig.autoModLogChannel ? `<#${freshConfig.autoModLogChannel}>` : 'Défaut (mod-logs)', inline: true }
            )
            .setDescription('Utilisez `/setlogs #salon` pour configurer le salon de logs.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp();

          const backRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
          await btn.update({ embeds: [logsEmbed], components: [backRow] });
        }

        else if (cid === 'dash_autorole') {
          const freshConfig = client.guildConfigs.get(guildId) || {};
          const arEmbed = new EmbedBuilder()
            .setTitle('🎭 Auto-Role Configuration')
            .setColor(0x9b59b6)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: '🎭 Rôle actuel', value: freshConfig.autoRole ? `<@&${freshConfig.autoRole}>` : '❌ Désactivé', inline: true }
            )
            .setDescription('Utilisez `/autorole @rôle` pour définir le rôle automatique.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp();

          const backRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dash_main').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary));
          await btn.update({ embeds: [arEmbed], components: [backRow] });
        }

        else if (cid === 'dash_refresh') {
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
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      try {
        await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
      } catch {}
    }
  },
};
