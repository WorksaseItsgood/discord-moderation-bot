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
