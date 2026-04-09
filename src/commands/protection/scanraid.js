import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { getRaidStatus, quarantineUser } from '../../handlers/raidHandler.js';

export default {
  data: new SlashCommandBuilder()
    .setName('scanraid')
    .setNameLocalizations({ fr: 'scanraid', 'en-US': 'scanraid' })
    .setDescription('Scanne les récents rejoints pour détecter les comptes suspects'),
  name: 'scanraid',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const guild = interaction.guild;
      const guildId = guild.id;

      const loadingEmbed = new EmbedBuilder()
        .setTitle('🔍 Scan en cours...')
        .setDescription('Analyse des récents membres pour détecter les comptes suspects.')
        .setColor(0xFFAA00)
        .setTimestamp();

      await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });

      const members = await guild.members.fetch();
      const recentMembers = members.filter(m => {
        const joinTime = m.joinedAt;
        if (!joinTime) return false;
        const daysSinceJoin = (Date.now() - joinTime.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceJoin <= 7;
      });

      const riskyMembers = [];
      const safeMembers = [];

      for (const member of recentMembers.values()) {
        const riskScore = calculateRiskScore(member);
        if (riskScore >= 50) {
          riskyMembers.push({ member, riskScore });
        } else {
          safeMembers.push({ member, riskScore });
        }
      }

      riskyMembers.sort((a, b) => b.riskScore - a.riskScore);
      safeMembers.sort((a, b) => b.riskScore - a.riskScore);

      const riskyEmbed = new EmbedBuilder()
        .setTitle('⚠️ Membres à Risque')
        .setColor(0xFF0000)
        .setTimestamp();

      if (riskyMembers.length === 0) {
        riskyEmbed.setDescription('Aucun membre suspect détecté.');
      } else {
        const riskyList = riskyMembers.slice(0, 10).map(({ member, riskScore }) => {
          return `⚠️ ${member.user.tag} (${member.user.id})\n   Score: ${riskScore}/100`;
        }).join('\n\n');
        riskyEmbed.addFields({ name: 'Membres risqués', value: riskyList || 'Aucun', inline: false });
      }

      const safeEmbed = new EmbedBuilder()
        .setTitle('✅ Analyse Terminée')
        .setColor(0x00FF00)
        .addFields(
          { name: 'Membres analysés', value: `${recentMembers.size}`, inline: true },
          { name: 'Risqués', value: `${riskyMembers.length}`, inline: true },
          { name: 'Sûrs', value: `${safeMembers.length}`, inline: true }
        )
        .setTimestamp();

      const quarantineAllButton = riskyMembers.length > 0
        ? new ButtonBuilder()
            .setCustomId('scanraid_quarantine_all')
            .setLabel(`Quarantaine tous (${riskyMembers.length})`)
            .setStyle(ButtonStyle.Danger)
        : null;

      const row = quarantineAllButton
        ? new ActionRowBuilder().addComponents(quarantineAllButton)
        : null;

      await interaction.editReply({ embeds: [safeEmbed, riskyEmbed], components: row ? [row] : [] });

      if (quarantineAllButton) {
        client.buttonHandlers?.set('scanraid_quarantine_all', async (btnInteraction) => {
          try {
            let quarantinedCount = 0;
            for (const { member } of riskyMembers) {
              try {
                await quarantineUser(member, guildId, client);
                quarantinedCount++;
              } catch (err) {
                console.error(`Erreur quarantine ${member.user.tag}:`, err);
              }
            }

            const successEmbed = new EmbedBuilder()
              .setTitle('✅ Quarantaine Appliquée')
              .setDescription(`**${quarantinedCount}** membres ont été mis en quarantaine.`)
              .setColor(0x00FF00)
              .setTimestamp();

            await btnInteraction.update({ embeds: [successEmbed], components: [] });
          } catch (err) {
            console.error('Erreur quarantine all:', err);
            await btnInteraction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
          }
        });
      }
    } catch (error) {
      console.error('Erreur scanraid:', error);
      await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
    }
  },
};

function calculateRiskScore(member) {
  let score = 0;

  if (!member.user.bot) {
    const accountAge = Date.now() - member.user.createdAt.getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);

    if (daysOld < 7) score += 40;
    else if (daysOld < 30) score += 20;

    if (member.user.avatar === null) score += 15;

    if (member.user.username.match(/\d{4,}/)) score += 20;
  } else {
    score += 5;
  }

  const joinTime = member.joinedAt;
  if (joinTime) {
    const daysSinceJoin = (Date.now() - joinTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceJoin < 1) score += 15;
  }

  return Math.min(score, 100);
}
