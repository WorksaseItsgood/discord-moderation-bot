const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Trivia command - Trivia poll game
module.exports = {
  data: new SlashCommandBuilder()
    .setName('polltrivia')
    .setDescription('Start a trivia poll game')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of questions')
        .setRequired(false)
        .setMinValue(3)
        .setMaxValue(10)),
  async execute(interaction, client) {
    const questionCount = interaction.options.getInteger('count') || 5;
    
    const questions = [
      { q: 'What is the capital of France?', a: 'Paris', options: ['Paris', 'London', 'Berlin', 'Madrid'] },
      { q: 'What is 2 + 2?', a: '4', options: ['3', '4', '5', '6'] },
      { q: 'What color is the sky?', a: 'Blue', options: ['Blue', 'Green', 'Red', 'Yellow'] },
      { q: 'What is the largest planet?', a: 'Jupiter', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'] },
      { q: 'What freezes at 0C?', a: 'Water', options: ['Water', 'Fire', 'Gold', 'Air'] },
      { q: 'How many legs does a spider have?', a: '8', options: ['6', '8', '10', '12'] },
      { q: 'What is the fastest land animal?', a: 'Cheetah', options: ['Lion', 'Cheetah', 'Tiger', 'Horse'] },
      { q: 'What gas do plants absorb?', a: 'Carbon Dioxide', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'] }
    ];
    
    // Shuffle and pick
    const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, questionCount);
    
    if (!client.triviaGames) client.triviaGames = new Map();
    client.triviaGames.set(interaction.user.id, { questions: shuffled, current: 0, score: 0 });
    
    const q = shuffled[0];
    const embed = new EmbedBuilder()
      .setTitle('Trivia Question 1/' + questionCount)
      .setColor(0x9b59b6)
      .setDescription('**' + q.q + '**')
      .addFields([{ name: 'Options', value: q.options.join('\n'), inline: true }])
      .setFooter({ text: 'Answer by selecting a reaction!' });
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    
    // Add reaction options
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    for (let i = 0; i < q.options.length; i++) {
      await message.react(emojis[i]);
    }
    
    const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === interaction.user.id;
    const collector = message.createReactionCollector({ filter, time: 15000, max: 1 });
    
    collector.on('collect', (reaction) => {
      const answerIndex = emojis.indexOf(reaction.emoji.name);
      const correct = q.options[answerIndex] === q.a;
      
      if (correct) {
        const game = client.triviaGames.get(interaction.user.id);
        game.score++;
        client.triviaGames.set(interaction.user.id, game);
      }
      
      const resultEmbed = new EmbedBuilder()
        .setTitle(correct ? '✅ Correct!' : '❌ Wrong!')
        .setDescription(correct ? 'The answer was: ' + q.a : 'The answer was: ' + q.a)
        .setColor(correct ? 0x2ecc71 : 0xe74c3c);
      
      message.edit({ embeds: [resultEmbed] });
    });
  }
};