const { EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (customId.startsWith('shield_')) {
      await handleShieldButton(interaction, client);
    }
  }
};

async function handleShieldButton(interaction, client) {
  const guildId = interaction.guild.id;

  // Initialize config if not exists
  if (!client.shieldConfig) client.shieldConfig = new Map();
  if (!client.raidConfig) client.raidConfig = new Map();

  const config = client.shieldConfig.get(guildId) || getDefaultConfig();
  const raidConfig = client.raidConfig.get(guildId) || { enabled: false, whitelist: [] };

  const customId = interaction.customId;

  switch (customId) {
    case 'shield_toggle':
      config.enabled = !config.enabled;
      raidConfig.enabled = config.enabled;
      client.shieldConfig.set(guildId, config);
      client.raidConfig.set(guildId, raidConfig);
      await interaction.reply({
        content: config.enabled ? '🛡️ UltraShield Activé!' : '🔴 UltraShield Désactivé!',
        ephemeral: true
      });
      break;

    case 'shield_whitelist':
      await interaction.reply({
        content: '👥 Pour whitelist un utilisateur: `/shield whitelist <@user>`',
        ephemeral: true
      });
      break;

    case 'shield_logs':
      await interaction.reply({
        content: '📜 Configure le salon de logs avec `/shield logs #salon`',
        ephemeral: true
      });
      break;

    case 'shield_info':
      const infoEmbed = new EmbedBuilder()
        .setTitle('🛡️ UltraShield v2 - Anti-Raid System')
        .setColor(0x5865F2)
        .setDescription('Système de protection avancé contre les raids.')
        .addFields(
          { name: 'Anti-Bot-Add', value: 'Kicks les bots non autorisés', inline: true },
          { name: 'Anti-Channel-Delete', value: 'Recrée les salons supprimés', inline: true },
          { name: 'Anti-Role-Delete', value: 'Recrée les rôles supprimés', inline: true },
          { name: 'Anti-Webhook', value: 'Protège les webhooks', inline: true },
          { name: 'Anti-Ban-Wave', value: 'Détecte les vagues de bans', inline: true },
          { name: 'Anti-Kick-Wave', value: 'Détecte les vagues de kicks', inline: true }
        )
        .setFooter({ text: 'Niotic - UltraShield v2' });
      await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
      break;

    case 'shield_status':
      const isLocked = client.shieldLocked?.get(guildId);
      const statusEmbed = new EmbedBuilder()
        .setTitle('🛡️ Status UltraShield')
        .setColor(0x5865F2)
        .addFields(
          { name: 'Protection', value: config.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
          { name: 'Raid Mode', value: isLocked ? '🔒 ACTIF' : '🟢 Libre', inline: true },
          { name: 'Anti-Bot', value: config.antiBotAdd ? '✅' : '❌', inline: true },
          { name: 'Anti-Channel', value: config.antiChannelDelete ? '✅' : '❌', inline: true },
          { name: 'Anti-Role', value: config.antiRoleDelete ? '✅' : '❌', inline: true },
          { name: 'Anti-Webhook', value: config.antiWebhook ? '✅' : '❌', inline: true },
          { name: 'Anti-BanWave', value: config.antiBanWave ? '✅' : '❌', inline: true },
          { name: 'Anti-KickWave', value: config.antiKickWave ? '✅' : '❌', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Niotic - UltraShield v2' });
      await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
      break;

    default:
      await interaction.reply({ content: 'Option non reconnue.', ephemeral: true });
  }
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
