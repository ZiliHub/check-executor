const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const API_URL = "https://temp.hackgpo59.workers.dev/";

const executors = {
  "delta": { platform: "📱 Mobile", base: "🟢 FULL SUPPORT", baseScore: 96 },
  "arceus x": { platform: "📱 Mobile", base: "🟢 FULL SUPPORT", baseScore: 95 },
  "vega": { platform: "📱 Mobile", base: "⚪ UNKNOWN", baseScore: 0 },
  "codex": { platform: "📱 Mobile", base: "🟡 LIMITED", baseScore: 68 },

  "synapse z": { platform: "🖥 PC", base: "🟢 FULL SUPPORT", baseScore: 99 },
  "volt": { platform: "🖥 PC", base: "🟢 FULL SUPPORT", baseScore: 98 },
  "wave": { platform: "🖥 PC", base: "🟡 LIMITED", baseScore: 75 }
};

// 📥 SEND VOTE
async function sendVote(name, type, user) {
  try {
    await fetch(API_URL + "vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, user })
    });
  } catch (e) {
    console.log("Vote error:", e.message);
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

// 🚀 READY
client.once("ready", async () => {
  console.log("Bot online");

  const channel = await client.channels.fetch("1488456249900142645");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("panel").setLabel("🎮 Open Panel").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("lb").setLabel("🏆 Leaderboard").setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: "⚙️ EXECUTOR SYSTEM",
    components: [row]
  });
});

// 🎮 INTERACTION
client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isButton()) return;

  // ================= PANEL =================
  if (interaction.customId === "panel") {
    let text = "";

    for (let name in executors) {
      let stats = await getStats(name);

      let status, percent;

      if (!stats || (stats.good === 0 && stats.normal === 0 && stats.bad === 0)) {
        status = executors[name].base;
        percent = executors[name].baseScore;
      } else {
        status = stats.status;
        percent = stats.percent;
      }

      text += `**${name}**\n${executors[name].platform} | ${status} | ${percent}%\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 Executor List")
      .setDescription(text)
      .setColor(0x00ccff);

    await interaction.reply({
      embeds: [embed],
      ephemeral: false
    });

    // ✅ FIX DELETE CHUẨN
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 90000);
  }

  // ================= LEADERBOARD =================
  if (interaction.customId === "lb") {
    const data = await getLeaderboard();

    let mobile = "";
    let pc = "";

    data.forEach((e, i) => {
      const line = `#${i + 1} ${e.name} — ${e.score}%\n`;

      // ✅ FIX PHÂN LOẠI
      if (executors[e.name] && executors[e.name].platform.includes("Mobile")) {
        mobile += line;
      } else {
        pc += line;
      }
    });

    const embed = new EmbedBuilder()
      .setTitle("🏆 Leaderboard")
      .addFields(
        { name: "📱 Mobile", value: mobile || "No data" },
        { name: "🖥 PC", value: pc || "No data" }
      )
      .setColor(0x00ff99);

    await interaction.reply({
      embeds: [embed],
      ephemeral: false
    });

    // ✅ FIX DELETE
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 90000);
  }

  // ================= VOTE =================
  const parts = interaction.customId.split("_");

  if (parts.length === 2) {
    const type = parts[0];
    const name = parts[1];

    await sendVote(name, type, interaction.user.id);

    await interaction.reply({
      content: `✅ Voted ${type} for ${name}`,
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
