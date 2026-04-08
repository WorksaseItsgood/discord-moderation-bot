const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: '🔨 Bannir un membre',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Raison du ban').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '❌ Membre non trouvé.', ephemeral: true });
    }

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de bannir.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ Je n\'ai pas la permission de bannir.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔨 Confirmation - Ban')
      .setColor(16711680)
      .setDescription(`Voulez-vous bannir **${user.tag}** ?`)
      .addFields(
        { name: 'Utilisateur', value: `${user} (${user.id})`, inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`ban_confirm_${user.id}`).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`ban_cancel_${user.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
