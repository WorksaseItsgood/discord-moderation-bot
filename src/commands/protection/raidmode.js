import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { enableRaidMode, disableRaidMode, getRaidStatus } from '../../handlers/raidHandler.js';
export default {
  data: new SlashCommandBuilder().setName('raidmode').setNameLocalizations({ fr: 'raidmode', 'en-US': 'raidmode' }).setDescription('Control raid protection mode').setDescriptionLocalizations({ fr: 'Contrôler le mode anti-raid', 'en-US': 'Control raid protection mode' }).addStringOption(o => o.setName('action').setNameLocalizations({ fr: 'action' }).setDescription('Action').setDescriptionLocalizations({ fr: 'Action' }).addChoices({ name: 'enable', value: 'enable' }, { name: 'disable', value: 'disable' }, { name: 'status', value: 'status' })),
  name: 'raidmode', permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageChannels] },
  async execute(interaction, client) {
    const action = interaction.options.getString('action') || 'status';
    const guildId = interaction.guild.id;
    const status = getRaidStatus(guildId, client);
    const userId = interaction.user.id;
    if (action === 'status') {
      const embed = new EmbedBuilder().setTitle('🛡️ Raid Mode').setColor(status.active ? 0xff0000 : 0x00ff00).addFields({ name: 'Statut', value: status.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true }, { name: 'Type', value: status.type || '-', inline: true }, { name: 'Déclenché par', value: status.triggeredBy || '-', inline: true }).setTimestamp();
      const enableBtn = new ButtonBuilder().setCustomId('raidmode_enable').setLabel('🔒 Activer').setStyle(ButtonStyle.Danger);
      const disableBtn = new ButtonBuilder().setCustomId('raidmode_disable').setLabel('🟢 Désactiver').setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder().addComponents(enableBtn, disableBtn);
      await interaction.deferReply({ ephemeral: true });
      const reply = await interaction.editReply({ embeds: [embed], components: [row] });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        await btn.deferUpdate();
        if (btn.customId === 'raidmode_enable') {
          const count = await enableRaidMode(interaction.guild, interaction.user.tag, client);
          await btn.editReply({ content: `🔒 Raid Mode activé! ${count} salons verrouillés.`, embeds: [], components: [] });
        } else if (btn.customId === 'raidmode_disable') {
          await disableRaidMode(interaction.guild, client);
          await btn.editReply({ content: '🟢 Raid Mode désactivé!', embeds: [], components: [] });
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });
    } else if (action === 'enable') {
      const count = await enableRaidMode(interaction.guild, interaction.user.tag, client);
      await interaction.reply({ content: `🔒 Raid Mode activé! ${count} salons verrouillés.`, ephemeral: true });
    } else {
      await disableRaidMode(interaction.guild, client);
      await interaction.reply({ content: '🟢 Raid Mode désactivé!', ephemeral: true });
    }
  },
};
