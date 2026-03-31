const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * ULTRA ECONOMY SYSTEM
 * Bank, work, crime, shop, inventory
 */

class UltraEconomySystem {
  constructor(client) {
    this.client = client;
    this.balances = new Map();
    this.banks = new Map();
    this.inventories = new Map();
    this.cooldowns = new Map();
    
    this.config = {
      startingBalance: 1000,
      workMin: 100,
      workMax: 500,
      crimeMin: 500,
      crimeMax: 2000,
      crimeFailRate: 0.4,
      dailyReward: 500,
    };
  }
  
  async getBalance(userId) {
    return this.balances.get(userId) || 0;
  }
  
  async getBank(userId) {
    return this.banks.get(userId) || 0;
  }
  
  async getNetWorth(userId) {
    const balance = await this.getBalance(userId);
    const bank = await this.getBank(userId);
    const inventory = await this.getInventory(userId);
    
    let value = 0;
    for (const item of inventory) {
      value += (item.price || 0) * item.amount;
    }
    
    return balance + bank + value;
  }
  
  async deposit(userId, amount) {
    const balance = await this.getBalance(userId);
    const bank = await this.getBank(userId);
    
    if (amount > balance) return false;
    
    this.balances.set(userId, balance - amount);
    this.banks.set(userId, bank + amount);
    
    return true;
  }
  
  async withdraw(userId, amount) {
    const bank = await this.getBank(userId);
    const balance = await this.getBalance(userId);
    
    if (amount > bank) return false;
    
    this.banks.set(userId, bank - amount);
    this.balances.set(userId, balance + amount);
    
    return true;
  }
  
  async work(userId) {
    // Check cooldown
    const lastWork = this.cooldowns.get(`work-${userId}`);
    if (lastWork && Date.now() - lastWork < 60000) {
      return { success: false, message: 'Wait 60s between work!' };
    }
    
    this.cooldowns.set(`work-${userId}`, Date.now());
    
    const amount = Math.floor(Math.random() * (this.config.workMax - this.config.workMin)) + this.config.workMin;
    const balance = await this.getBalance(userId);
    this.balances.set(userId, balance + amount);
    
    return { success: true, amount, message: `+${amount} coins!` };
  }
  
  async crime(userId) {
    // Check cooldown
    const lastCrime = this.cooldowns.get(`crime-${userId}`);
    if (lastCrime && Date.now() - lastCrime < 120000) {
      return { success: false, message: 'Wait 2m between crimes!' };
    }
    
    this.cooldowns.set(`crime-${userId}`, Date.now());
    
    if (Math.random() < this.config.crimeFailRate) {
      // Failed - lose money
      const fine = Math.floor(Math.random() * this.config.crimeMax) + this.config.crimeMin;
      const balance = await this.getBalance(userId);
      this.balances.set(userId, Math.max(0, balance - fine));
      
      return { success: false, message: `Caught! -${fine} coins!` };
    }
    
    const amount = Math.floor(Math.random() * (this.config.crimeMax - this.config.crimeMin)) + this.config.crimeMin;
    const balance = await this.getBalance(userId);
    this.balances.set(userId, balance + amount);
    
    return { success: true, amount: `+${amount} coins!` };
  }
  
  async daily(userId) {
    const lastDaily = this.cooldowns.get(`daily-${userId}`);
    if (lastDaily && Date.now() - lastDaily < 86400000) {
      return { success: false, message: 'Wait 24h for daily!' };
    }
    
    this.cooldowns.set(`daily-${userId}`, Date.now());
    
    const balance = await this.getBalance(userId);
    this.balances.set(userId, balance + this.config.dailyReward);
    
    return { success: true, amount: `+${this.config.dailyReward} coins!` };
  }
  
  async getInventory(userId) {
    return this.inventories.get(userId) || [];
  }
  
  async buyItem(userId, item, amount = 1) {
    const balance = await this.getBalance(userId);
    const cost = item.price * amount;
    
    if (cost > balance) return false;
    
    this.balances.set(userId, balance - cost);
    
    const inventory = await this.getInventory(userId);
    const existing = inventory.find(i => i.id === item.id);
    
    if (existing) {
      existing.amount += amount;
    } else {
      inventory.push({ ...item, amount });
    }
    
    this.inventories.set(userId, inventory);
    
    return true;
  }
  
  async sellItem(userId, itemId, amount = 1) {
    const inventory = await this.getInventory(userId);
    const item = inventory.find(i => i.id === itemId);
    
    if (!item || item.amount < amount) return false;
    
    item.amount -= amount;
    
    const balance = await this.getBalance(userId);
    const sellPrice = Math.floor((item.price || 0) * amount * 0.8);
    this.balances.set(userId, balance + sellPrice);
    
    if (item.amount === 0) {
      this.inventories.set(userId, inventory.filter(i => i.id !== itemId));
    }
    
    return sellPrice;
  }
  
  async createShop(guild) {
    const shopItems = [
      { id: 'lucky_clover', name: '🍀 Lucky Clover', description: 'Boost work earnings', price: 5000, type: 'boost', boostMultiplier: 1.5 },
      { id: 'bank_charm', name: '🏦 Bank Charm', description: 'Interest bonus', price: 10000, type: 'boost' },
      { id: 'crime_protection', name: '🛡️ Crime Protection', description: 'Reduce crime risk', price: 7500, type: 'boost', crimeRiskReduction: 0.3 },
      { id: 'gift_box', name: '🎁 Mystery Box', description: 'Random reward', price: 2500, type: 'consumable', rewardMin: 100, rewardMax: 10000 },
      { id: 'multiplier', name: '⚡ Multiplier', description: '2x all earnings', price: 50000, type: 'consumable', multiplier: 2 },
    ];
    
    return shopItems;
  }
}

// Export
module.exports = UltraEconomySystem;