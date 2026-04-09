import { EmbedBuilder } from 'discord.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;

      // Check permissions
      if (cmd.permissions?.user?.length) {
        const userPerms = interaction.member?.permissions;
        if (!userPerms?.has(...cmd.permissions.user)) {
          return interaction.reply({
            content: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
            ephemeral: true,
          });
        }
      }

      try {
        await cmd.execute(interaction, client);
      } catch (err) {
        console.error(`[Command Error] ${interaction.commandName}:`, err);
        try {
          await interaction.reply({
            content: `❌ Erreur: ${err.message}`,
            ephemeral: true,
          });
        } catch {}
      }
      return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      const handler = client.buttonHandlers.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction, client);
        } catch (err) {
          console.error(`[Button Error] ${interaction.customId}:`, err);
          try {
            await interaction.reply({ content: '❌ Erreur: ' + err.message, ephemeral: true });
          } catch {}
        }
      }
      return;
    }

    // Handle select menus
    if (interaction.isSelectMenu()) {
      const handler = client.selectMenuHandlers.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction, client);
        } catch (err) {
          console.error(`[SelectMenu Error] ${interaction.customId}:`, err);
        }
      }
      return;
    }
  },
};
