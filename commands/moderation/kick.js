const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: '👢 Kick un membre',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick un membre du serveur')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Raison du kick').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de kick.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Membre non trouvé sur ce serveur.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has('KickMembers')) {
      return interaction.reply({ content: '❌ Je n\'ai pas la permission de kick.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('👢 Confirmation - Kick')
      .setColor(16744448)
      .setDescription(`Voulez-vous kick **${user.tag}** ?`)
      .addFields(
        { name: 'Utilisateur', value: `${user} (${user.id})`, inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`kick_confirm_${user.id}`).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`kick_cancel_${user.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
