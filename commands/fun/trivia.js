/**
 * Trivia Command - Trivia question
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const trivia = [
  { q: "What is the capital of Australia?", a: "Canberra", options: ["Sydney", "Canberra", "Melbourne", "Perth"] },
  { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Venus", "Jupiter", "Mars", "Saturn"] },
  { q: "What is the largest mammal in the world?", a: "Blue Whale", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"] },
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"] },
  { q: "What is the chemical symbol for gold?", a: "Au", options: ["Ag", "Au", "Go", "Gd"] },
  { q: "How many continents are there?", a: "7", options: ["5", "6", "7", "8"] },
  { q: "What is the fastest land animal?", a: "Cheetah", options: ["Lion", "Cheetah", "Gazelle", "Leopard"] },
  { q: "Which year did the Titanic sink?", a: "1912", options: ["1905", "1912", "1920", "1898"] },
  { q: "What is the largest ocean?", a: "Pacific Ocean", options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"] },
  { q: "Who wrote Romeo and Juliet?", a: "William Shakespeare", options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"] },
  { q: "What is the hardest natural substance?", a: "Diamond", options: ["Titanium", "Diamond", "Steel", "Quartz"] },
  { q: "What is the smallest country in the world?", a: "Vatican City", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"] },
  { q: "Which element has the atomic number 1?", a: "Hydrogen", options: ["Helium", "Hydrogen", "Oxygen", "Carbon"] },
  { q: "What is the longest river in the world?", a: "Nile", options: ["Amazon", "Nile", "Yangtze", "Mississippi"] },
  { q: "How many bones are in the adult human body?", a: "206", options: ["186", "206", "226", "256"] },
  { q: "What is the capital of Japan?", a: "Tokyo", options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"] },
  { q: "Who discovered penicillin?", a: "Alexander Fleming", options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Isaac Newton"] },
  { q: "What is the largest desert in the world?", a: "Sahara", options: ["Arabian", "Gobi", "Sahara", "Kalahari"] },
  { q: "What gas do plants absorb from the atmosphere?", a: "Carbon Dioxide", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"] },
  { q: "Which country has the most natural lakes?", a: "Canada", options: ["USA", "Russia", "Canada", "Brazil"] }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a trivia question'),
  
  async execute(interaction, client) {
    const q = trivia[Math.floor(Math.random() * trivia.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🧠 Trivia Question')
      .setDescription(q.q)
      .addFields(
        { name: 'Options', value: q.options.map((o, i) => `${i + 1}. ${o}`).join('\n') }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
    
    // Note: This is a basic display - actual answer checking would need a collector
  }
};