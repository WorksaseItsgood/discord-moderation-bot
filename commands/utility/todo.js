/**
 * Todo Command - Manage todo list
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Manage your todo list')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a todo')
        .addStringOption(opt => opt.setName('task').setDescription('Task to add').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List your todos')
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a todo')
        .addIntegerOption(opt => opt.setName('number').setDescription('Todo number to remove').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear all todos')
    ),
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    if (!client.todos) client.todos = new Map();
    if (!client.todos.has(interaction.user.id)) {
      client.todos.set(interaction.user.id, []);
    }
    const todos = client.todos.get(interaction.user.id);
    
    if (subcommand === 'add') {
      const task = interaction.options.getString('task');
      todos.push({ task, completed: false });
      await interaction.reply(`✅ Added: ${task}`);
    } else if (subcommand === 'list') {
      if (todos.length === 0) {
        return interaction.reply('Your todo list is empty!');
      }
      const list = todos.map((t, i) => `${i + 1}. ${t.completed ? '~~' : ''}${t.task}${t.completed ? '~~' : ''}`).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('📝 Your Todo List')
        .setDescription(list)
        .setColor(0x0099ff);
      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'remove') {
      const num = interaction.options.getInteger('number') - 1;
      if (num < 0 || num >= todos.length) {
        return interaction.reply('Invalid todo number!');
      }
      const removed = todos.splice(num, 1)[0];
      await interaction.reply(`❌ Removed: ${removed.task}`);
    } else if (subcommand === 'clear') {
      todos.length = 0;
      await interaction.reply('✅ Todo list cleared!');
    }
  }
};