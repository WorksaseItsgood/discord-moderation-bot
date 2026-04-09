/**
 * Interaction Create Event Handler
 * Handles slash commands, buttons, select menus, and modals
 */

import { EmbedBuilder } from 'discord.js';
import { setLogClient } from '../utils/logManager.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    // Initialize log manager with client
    setLogClient(client);

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) {
        console.warn(`[Interaction] Unknown command: ${interaction.commandName}`);
        return;
      }

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
        console.error(`[Command Error] /${interaction.commandName}:`, err);
        try {
          await interaction.reply({
            content: `❌ Erreur: ${err.message || 'Une erreur inattendue est survenue.'}`,
            ephemeral: true,
          });
        } catch (replyErr) {
          console.error('[Interaction] Failed to send error reply:', replyErr);
        }
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
            await interaction.reply({ 
              content: `❌ Erreur lors du traitement du bouton: ${err.message || 'Erreur inconnue'}`,
              ephemeral: true 
            });
          } catch (replyErr) {
            try {
              await interaction.editReply({ 
                content: `❌ Erreur: ${err.message || 'Erreur inconnue'}`,
                components: [] 
              });
            } catch {}
          }
        }
      } else {
        // Handler not found - might have expired
        console.warn(`[Button] Handler not found: ${interaction.customId}`);
        try {
          await interaction.reply({ 
            content: '⚠️ Ce bouton a expiré ou n\'est plus disponible.',
            ephemeral: true 
          });
        } catch {}
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
          try {
            await interaction.reply({ 
              content: `❌ Erreur lors du traitement de la sélection: ${err.message || 'Erreur inconnue'}`,
              ephemeral: true 
            });
          } catch (replyErr) {
            try {
              await interaction.editReply({ 
                content: `❌ Erreur: ${err.message || 'Erreur inconnue'}`,
                components: [] 
              });
            } catch {}
          }
        }
      } else {
        console.warn(`[SelectMenu] Handler not found: ${interaction.customId}`);
        try {
          await interaction.reply({ 
            content: '⚠️ Cette sélection a expiré ou n\'est plus disponible.',
            ephemeral: true 
          });
        } catch {}
      }
      return;
    }

    // Handle modals
    if (interaction.isModalSubmit()) {
      const handler = client.modalHandlers.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction, client);
        } catch (err) {
          console.error(`[Modal Error] ${interaction.customId}:`, err);
          try {
            await interaction.reply({ 
              content: `❌ Erreur lors du traitement du formulaire: ${err.message || 'Erreur inconnue'}`,
              ephemeral: true 
            });
          } catch {}
        }
      }
      return;
    }

    // Handle autocomplete
    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd?.autocomplete) {
        try {
          await cmd.autocomplete(interaction, client);
        } catch (err) {
          console.error(`[Autocomplete Error] /${interaction.commandName}:`, err);
        }
      }
      return;
    }
  },
};
