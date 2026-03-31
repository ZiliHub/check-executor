const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const API_URL = "https://temp.hackgpo59.workers.dev/";

const executors = {
  "delta": { name: "Delta", platform: "📱 Mobile", base: "🟢 FULL SUPPORT", baseScore: 96 },
  "arceus x": { name: "Arceus X", platform: "📱 Mobile", base: "🟢 FULL SUPPORT", baseScore: 95 },
  "vega": { name: "Vega", platform: "📱 Mobile", base: "⚪ UNKNOWN", baseScore: 0 },
  "codex": { name: "Codex", platform: "📱 Mobile", base: "🟡 LIMITED", baseScore: 68 },
  "synapse z": { name: "Synapse Z", platform: "🖥 PC", base: "🟢 FULL SUPPORT", baseScore: 99 },
  "volt": { name: "Volt", platform: "🖥 PC", base: "🟢 FULL SUPPORT", baseScore: 98 },
  "wave": { name: "Wave", platform: "🖥 PC", base: "🟡 LIMITED", baseScore: 75 }
};

// 🌟 PROGRESS BAR GENERATOR
function createProgressBar(percent) {
  const totalBlocks = 10;
  const filledBlocks = Math.round((percent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return `**\`[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}]\`**`;
}

// 📥 SEND VOTE (Fixed to return API response for cooldown handling)
async function sendVote(name, type, user) {
  try {
    const res = await fetch(API_URL + "vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, user })
    });
    return await res.json(); // Returns { success: true/false, error: "..." }
  } catch (e) {
    console.log("Vote error:", e.message);
    return { success: false, error: "Failed to connect to the database." };
  }
}

// 📊 GET STATS
async function getStats(name) {
  try {
    const res = await fetch(API_URL + "stats/" + name);
    return await res.json();
  } catch {
    return null;
  }
}

// 🏆 GET LEADERBOARD
async function getLeaderboard() {
  try {
    const res = await fetch(API_URL + "leaderboard");
    return await res.json();
  } catch {
    return [];
  }
}

// 🚀 READY & SEND MAIN MESSAGE
client.once("ready", async () => {
  console.log(`✅ Bot ${client.user.tag} is online!`);

  const channel = await client.channels.fetch("1488456249900142645").catch(() => null);
  if (!channel) return console.log("❌ Could not find the specified channel!");

  // Main UI Buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("btn_panel").setLabel("📊 Status Panel").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("btn_lb").setLabel("🏆 Leaderboard").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("btn_vote_start").setLabel("🗳️ Vote Executor").setStyle(ButtonStyle.Secondary)
  );

  const mainEmbed = new EmbedBuilder()
    .setTitle("🚀 EXECUTOR SYSTEM HUB")
    .setDescription("Welcome to the **Executor Status Hub**!\n\nClick the buttons below to check the current status, view the top executors, or vote for your favorite ones. All interactions are private (only you can see them).")
    .setColor("#2b2d31")
    .setImage("https://i.imgur.com/K9t6d5m.png") // Change banner here if needed
    .setFooter({ text: "System Auto-Updating", iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  await channel.send({ embeds: [mainEmbed], components: [row] });
});

// 🎮 INTERACTION HANDLER
client.on(Events.InteractionCreate, async interaction => {

  // ================= BUTTON HANDLERS =================
  if (interaction.isButton()) {

    // 1️⃣ PANEL BUTTON
    if (interaction.customId === "btn_panel") {
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle("📊 Live Executor Status")
        .setDescription("Current status of Executors based on API data and user votes.")
        .setColor("#00ccff")
        .setTimestamp();

      let mobileText = "";
      let pcText = "";

      for (let key in executors) {
        const ex = executors[key];
        let stats = await getStats(key);

        let status = ex.base;
        let percent = ex.baseScore;

        if (stats && (stats.good > 0 || stats.normal > 0 || stats.bad > 0)) {
          status = stats.status;
          percent = stats.percent;
        }

        const bar = createProgressBar(percent);
        const line = `> **${ex.name}**\n> Status: ${status} \n> Score: ${bar} **${percent}%**\n\n`;

        if (ex.platform.includes("Mobile")) mobileText += line;
        else pcText += line;
      }

      embed.addFields(
        { name: "📱 MOBILE EXECUTORS", value: mobileText || "Updating..." },
        { name: "🖥️ PC EXECUTORS", value: pcText || "Updating..." }
      );

      return interaction.editReply({ embeds: [embed] });
    }

    // 2️⃣ LEADERBOARD BUTTON
    if (interaction.customId === "btn_lb") {
      await interaction.deferReply({ ephemeral: true });

      const data = await getLeaderboard();
      const embed = new EmbedBuilder()
        .setTitle("🏆 Top Executors Leaderboard")
        .setDescription("Ranking based on user trust scores.")
        .setColor("#ffcc00");

      let mobileText = "";
      let pcText = "";

      data.forEach((e, i) => {
        const exConfig = executors[e.name.toLowerCase()];
        if (!exConfig) return;

        let rankIcon = "🏅";
        if (i === 0) rankIcon = "🥇";
        else if (i === 1) rankIcon = "🥈";
        else if (i === 2) rankIcon = "🥉";

        const bar = createProgressBar(e.score);
        const line = `**${rankIcon} ${exConfig.name}**\n${bar} **${e.score}%**\n\n`;

        if (exConfig.platform.includes("Mobile")) mobileText += line;
        else pcText += line;
      });

      embed.addFields(
        { name: "📱 TOP MOBILE", value: mobileText || "No data yet" },
        { name: "🖥️ TOP PC", value: pcText || "No data yet" }
      );

      return interaction.editReply({ embeds: [embed] });
    }

    // 3️⃣ VOTE START BUTTON (Opens dropdown)
    if (interaction.customId === "btn_vote_start") {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_vote_executor")
        .setPlaceholder("Click here to select an Executor...")
        .addOptions(
          Object.keys(executors).map(key => ({
            label: executors[key].name,
            description: `Platform: ${executors[key].platform}`,
            value: key,
            emoji: executors[key].platform.includes("Mobile") ? "📱" : "🖥️"
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      return interaction.reply({
        content: "🗳️ **Which Executor would you like to vote for?**\nPlease select from the menu below:",
        components: [row],
        ephemeral: true
      });
    }

    // 4️⃣ HANDLE GOOD/NORMAL/BAD VOTES
    if (interaction.customId.startsWith("vote_")) {
      const parts = interaction.customId.split("_"); 
      const type = parts[1]; // good, normal, bad
      const name = parts[2]; // delta, arceus x...

      await interaction.deferUpdate();

      // Get the response from the API
      const response = await sendVote(name, type, interaction.user.id);

      // Check for 12h cooldown or errors
      if (!response || !response.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle("⏳ Cooldown / Error")
          .setDescription(response?.error || "An unknown error occurred. Please try again later.")
          .setColor("#ff3333");

        return interaction.editReply({
          content: null,
          embeds: [errorEmbed],
          components: []
        });
      }

      // Success
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ Vote Recorded!")
        .setDescription(`Thank you <@${interaction.user.id}>! You voted **${type.toUpperCase()}** for **${executors[name].name}**.`)
        .setColor("#00ff99");

      return interaction.editReply({
        content: null,
        embeds: [successEmbed],
        components: [] 
      });
    }
  }

  // ================= SELECT MENU HANDLER =================
  if (interaction.isStringSelectMenu()) {
    
    // EXECUTOR SELECTED FROM MENU
    if (interaction.customId === "select_vote_executor") {
      const selectedExecutorKey = interaction.values[0];
      const exName = executors[selectedExecutorKey].name;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`vote_good_${selectedExecutorKey}`)
          .setLabel("Working (Good)")
          .setEmoji("🟢")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`vote_normal_${selectedExecutorKey}`)
          .setLabel("Issues (Normal)")
          .setEmoji("🟡")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`vote_bad_${selectedExecutorKey}`)
          .setLabel("Patched/Ban (Bad)")
          .setEmoji("🔴")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setTitle(`🗳️ Rate: ${exName}`)
        .setDescription(`How is the current status of **${exName}**?\n\n🟢 **Good**: Scripts run smoothly.\n🟡 **Normal**: Crashing, minor bugs, or annoying key system.\n🔴 **Bad**: Completely patched or causes bans.`)
        .setColor("#ffcc00");

      return interaction.update({
        content: null,
        embeds: [embed],
        components: [row]
      });
    }
  }
});

client.login(process.env.TOKEN);
