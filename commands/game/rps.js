/**
 * RPS Command - Rock Paper Scissors game
 */

const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock paper scissors'),
  
  async execute(interaction, client) {
    const choices = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
    const emojis = ['🪨', '📄', '✂️'];
    const botChoice = emojis[Math.floor(Math.random() * 3)];
    
    // Create buttons
    const row = new ActionRowBuilder();
    
    choices.forEach((choice, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`rps-${index}`)
          .setLabel(choice)
          .setStyle(ButtonStyle.Primary)
      );
    });
    
    const embed = new EmbedBuilder()
      .setTitle('✊✋✌️ Rock Paper Scissors')
      .setDescription('Choose your move!')
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    // Wait for button click
    const filter = i => i.user.id === interaction.user.id;
    
    try {
      const btnInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 15000 });
      
      const userChoice = emojis[parseInt(btnInteraction.customId.split('-')[1])];
      const userIndex = emojis.indexOf(userChoice);
      const botIndex = emojis.indexOf(botChoice);
      
      // Determine winner
      const result = (userIndex - botIndex + 3) % 3;
      
      let outcome;
      let color;
      
      if (result === 0) {
        outcome = "It's a tie!";
        color = 0xffaa00;
      } else if (result === 1) {
        outcome = 'You win!';
        color = 0x00ff00;
      } else {
        outcome = 'You lose!';
        color = 0xff0000;
      }
      
      const resultEmbed = new EmbedBuilder()
        .setTitle('✊✋✌️ Game Result')
        .setColor(color)
        .addFields(
          { name: 'You chose', value: userChoice, inline: true },
          { name: 'Bot chose', value: botChoice, inline: true },
          { name: 'Result', value: outcome }
        );
      
      await btnInteraction.update({ embeds: [resultEmbed], components: [] });
    } catch (e) {
      const timeoutEmbed = new EmbedBuilder()
        .setTitle('⏰ Game Timeout')
        .setDescription('You took too long!')
        .setColor(0xff0000);
      
      await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
    }
  }
};