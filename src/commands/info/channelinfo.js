import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setNameLocalizations({ fr: 'channelinfo', 'en-US': 'channelinfo' })
    .setDescription('Afficher les informations d\'un salon')
    .setDescriptionLocalizations({ fr: 'Afficher les informations d\'un salon', 'en-US': 'Show channel information' })
    .addChannelOption(option =>
      option.setName('channel')
        .setNameLocalizations({ fr: 'channel', 'en-US': 'channel' })
        .setDescription('Le salon')
        .setDescriptionLocalizations({ fr: 'Le salon', 'en-US': 'The channel' })
        .setRequired(false))
    .setDMPermission(false),
  name: 'channelinfo',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      const channelTypes = {
        0: 'Salon textuel',
        2: 'Salon vocal',
        4: 'Catégorie',
        5: 'Fil d\'actualités',
        6: 'Store',
        10: 'Fil de discussion',
        11: 'Fil public',
        12: 'Fil privé',
        13: 'Stage',
        14: 'Forum'
      };

      const createdAt = Math.floor(channel.createdAt.getTime() / 1000);

      const embed = new EmbedBuilder()
        .setTitle(`${channel.name}`)
        .setDescription(`**▸ ID:** ${channel.id}\n**▸ Type:** ${channelTypes[channel.type] || 'Inconnu'}\n**▸ Créé le:** <t:${createdAt}:R}`)
        .setColor(0x3498db)
        .setTimestamp();

      if (channel.type === 0) {
        const topic = channel.topic || 'Aucun';
        embed.addFields(
          { name: '▸ Sujet', value: topic, inline: false },
          { name: '▸ Rate limit', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Aucun', inline: true },
          { name: '▸ NSFW', value: channel.nsfw ? 'Oui' : 'Non', inline: true }
        );
      } else if (channel.type === 2) {
        embed.addFields(
          { name: '▸ Bitrate', value: channel.bitrate ? `${Math.floor(channel.bitrate / 1000)}kbps` : 'N/A', inline: true },
          { name: '▸ Utilisateurs max', value: channel.userLimit || 'Illimité', inline: true }
        );
      } else if (channel.type === 4) {
        embed.addFields({ name: '▸ Nombre de salons', value: `${channel.children?.size || 0}`, inline: true });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'affichage des informations du salon:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage des informations du salon.', ephemeral: true });
    }
  },
};
