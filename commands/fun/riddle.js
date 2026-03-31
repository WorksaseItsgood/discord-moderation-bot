const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Riddle command - Random riddle
module.exports = {
  data: new SlashCommandBuilder()
    .setName('riddle')
    .setDescription('Get a random riddle'),
  async execute(interaction, client) {
    const riddles = [
      { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "An echo" },
      { question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "A map" },
      { question: "The more you take, the more you leave behind. What am I?", answer: "Footsteps" },
      { question: "I am always hungry, I must always be fed. The finger I lick will soon turn red. What am I?", answer: "Fire" },
      { question: "I have keys but no locks. I have space but no room. You can enter, but can't go outside. What am I?", answer: "A keyboard" },
      { question: "I fly without wings. I cry without eyes. Wherever I go, darkness follows me. What am I?", answer: "A cloud" },
      { question: "What has to be broken before you can use it?", answer: "An egg" },
      { question: "I'm tall when I'm young, and I'm short when I'm old. What am I?", answer: "A candle" },
      { question: "What is full of holes but still holds water?", answer: "A sponge" },
      { question: "What gets wet while drying?", answer: "A towel" },
      { question: "What can you hold in your left hand but not in your right?", answer: "Your right elbow" },
      { question: "The person who makes it has no need of it. The person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?", answer: "A coffin" },
      { question: "I am an odd number. Take away a letter and I become even. What number am I?", answer: "Seven" },
      { question: "What goes up but never comes down?", answer: "Age" },
      { question: "A man who was outside in the rain without an umbrella or hat didn't get a single hair on his head wet. Why?", answer: "He was bald" },
      { question: "What belongs to you, but other people use it more than you?", answer: "Your name" },
      { question: "I have branches, but no fruit, trunk or leaves. What am I?", answer: "A bank" },
      { question: "What is seen in the middle of March and April that can't be seen at the beginning or end of either month?", answer: "The letter R" },
      { question: "What can you catch, but not throw?", answer: "A cold" },
      { question: "What has many teeth, but can't bite?", answer: "A comb" }
    ];
    
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    // Store the answer
    if (!client.riddles) client.riddles = new Map();
    client.riddles.set(interaction.user.id, { answer: riddle.answer.toLowerCase(), timestamp: Date.now() });
    
    const embed = new EmbedBuilder()
      .setTitle('🧩 Riddle')
      .setColor(0x9b59b6)
      .setDescription(`**${riddle.question}**`)
      .setFooter({ text: 'Use /answer <answer> to answer! (60 seconds)' });
    
    await interaction.reply({ embeds: [embed] });
    
    setTimeout(() => {
      if (client.riddles && client.riddles.has(interaction.user.id)) {
        client.riddles.delete(interaction.user.id);
      }
    }, 60000);
  }
};