const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Quickmaths command - Quick math challenge
module.exports = {
  data: new SlashCommandBuilder()
    .setName('quickmaths')
    .setDescription('Test your math skills')
    .addIntegerOption(option =>
      option.setName('difficulty')
        .setDescription('Difficulty level')
        .setRequired(false)
        .addChoices(
          { name: 'Easy', value: 1 },
          { name: 'Medium', value: 2 },
          { name: 'Hard', value: 3 }
        )),
  async execute(interaction, client) {
    const difficulty = interaction.options.getInteger('difficulty') || 1;
    
    let num1, num2, operator, answer, question;
    
    if (difficulty === 1) {
      // Easy: addition/subtraction single digits
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
      answer = operator === '+' ? num1 + num2 : num1 - num2;
    } else if (difficulty === 2) {
      // Medium: multiplication/division
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      operator = Math.random() > 0.5 ? '×' : '÷';
      if (operator === '÷') {
        const product = num1 * num2;
        num1 = product;
        answer = num2;
      } else {
        answer = num1 * num2;
      }
    } else {
      // Hard: multiple operations
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      const num3 = Math.floor(Math.random() * 10) + 1;
      operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
      if (operator === '×') {
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
      } else if (operator === '+') {
        answer = num1 + num2 + num3;
        question = `${num1} + ${num2} + ${num3} = ?`;
      } else {
        answer = num1 + num2 - num3;
        question = `${num1} + ${num2} - ${num3} = ?`;
      }
    }
    
    if (!question) {
      question = `${num1} ${operator} ${num2} = ?`;
    }
    
    const difficultyNames = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    
    // Store the answer in client for checking
    if (!client.mathProblems) client.mathProblems = new Map();
    client.mathProblems.set(interaction.user.id, { answer, timestamp: Date.now() });
    
    const embed = new EmbedBuilder()
      .setTitle('🧮 Quick Maths Challenge')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Difficulty', value: difficultyNames[difficulty], inline: true },
        { name: 'Question', value: question, inline: true }
      )
      .setDescription('Reply with the answer! (30 seconds)')
      .setFooter({ text: 'Use /answer <number> to answer' });
    
    await interaction.reply({ embeds: [embed] });
    
    // Set timeout to remove the problem
    setTimeout(() => {
      if (client.mathProblems && client.mathProblems.has(interaction.user.id)) {
        client.mathProblems.delete(interaction.user.id);
      }
    }, 30000);
  }
};