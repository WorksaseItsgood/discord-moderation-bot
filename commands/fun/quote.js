/**
 * Quote Command - Random quote
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Get busy living or get busy dying.", author: "Stephen King" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "Many of life's failures are people who did not realize how close they were to success when they gave up.", author: "Thomas A. Edison" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Money and success don't change people; they merely amplify what is already there.", author: "Will Smith" },
  { text: "Your birth certificate is an apology letter from the Universal Soul.", author: "Robert B. Woodward" },
  { text: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" },
  { text: "When one door of happiness closes, another opens, but often we look so long at the closed door that we don't see the one that has been opened for us.", author: "Helen Keller" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "I'd rather be a failure at something I love than a success at something I hate.", author: "George MacArthur" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random quote'),
  
  async execute(interaction, client) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('📜 Random Quote')
      .setDescription(`*"${quote.text}"*`)
      .addFields({ name: '— Author', value: quote.author })
      .setColor(0x00ffff);
    
    await interaction.reply({ embeds: [embed] });
  }
};