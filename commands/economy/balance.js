/**
 * Balance Command - Check user balance with beautiful UI
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy, success, error, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or another user\'s balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Get or initialize economy data
    if (!client.economy) {
      client.economy = new Map();
    }
    
    let userData = client.economy.get(`${interaction.guild.id}-${user.id}`);
    
    if (!userData) {
      userData = {
        wallet: 100,
        bank: 0,
        totalxp: 0,
        level: 1,
        daily: 0,
        weekly: 0,
        work: 0
      };
      client.economy.set(`${interaction.guild.id}-${user.id}`, userData);
    }
    
    const { wallet, bank, level, totalxp } = userData;
    const total = wallet + bank;
    
    // Create beautiful balance embed
    const embed = new EmbedBuilder()
      .setColor(COLORS.economy)
      .setAuthor({
        name: `💰 ${user.username}'s Wallet`,
        iconURL: botAvatar
      })
      .setTitle(`💰 ${user.username}'s Balance`)
      .setDescription(user.id === interaction.user.id 
        ? 'Here is your current balance:' 
        : `Here is ${user.username}'s balance:`)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: `CrowBot • Level ${level}`,
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { 
          name: '💵 Wallet', 
          value: `\`$${wallet.toLocaleString()}\``, 
          inline: true 
        },
        { 
          name: '🏦 Bank', 
          value: `\`$${bank.toLocaleString()}\``, 
          inline: true 
        },
        { 
          name: '💰 Total Net Worth', 
          value: `\`$${total.toLocaleString()}\``, 
          inline: false 
        }
      );
    
    // Add action buttons
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('balance-daily')
          .setLabel('📅 Daily')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('balance-weekly')
          .setLabel('📆 Weekly')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('balance-work')
          .setLabel('💼 Work')
          .setStyle(ButtonStyle.Primary)
      );
    
    const buttonRow2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('balance-deposit')
          .setLabel('⬇️ Deposit')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('balance-withdraw')
          .setLabel('⬆️ Withdraw')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('balance-gamble')
          .setLabel('🎰 Gamble')
          .setStyle(ButtonStyle.Danger)
      );
    
    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [embed], components: [buttonRow, buttonRow2] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
};