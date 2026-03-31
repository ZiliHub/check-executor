const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events,
  EmbedBuilder
} = require("discord.js");

const fetch = require("node-fetch");

// 🌐 KEEP ALIVE (IMPORTANT FOR RENDER)
require("http").createServer((req, res) => {
  res.end("Bot is alive");
}).listen(3000);

// 🔧 CONFIG
const API = "https://temp.hackgpo59.workers.dev"; // <-- CHANGE THIS

const executors = [
  "volt",
  "arceus",
  "delta",
  "potassium",
  "cosmic",
  "synapse z",
  "wave",
  "isaeva",
  "velocity",
  "codex",
  "xeno",
  "solara",
  "seliware",
  "sirhurt",
  "bunni.fun",
  "volcano",
  "vega x"
];

// 🤖 BOT INIT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🚀 READY
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch("1488456249900142645"); // <-- CHANGE

  const menu = new StringSelectMenuBuilder()
    .setCustomId("select_executor")
    .setPlaceholder("Select an executor")
    .addOptions(
      executors.map(e => ({
        label: e.toUpperCase(),
        value: e
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);

  await channel.send({
    content: "📊 **EXECUTOR RATING SYSTEM**",
    components: [row]
  });
});

// 🎯 INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  // 📌 SELECT EXECUTOR
  if (interaction.isStringSelectMenu()) {
    const name = interaction.values[0];

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`green_${name}`)
        .setLabel("🟢 Good")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`yellow_${name}`)
        .setLabel("🟡 Mid")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`red_${name}`)
        .setLabel("🔴 Bad")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: `Rate **${name}**`,
      components: [buttons],
      ephemeral: true
    });
  }

  // 📊 HANDLE VOTE
  if (interaction.isButton()) {
    const [type, name] = interaction.customId.split("_");

    try {
      // SEND VOTE
      await fetch(`${API}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          executor: name,
          vote: type,
          user: interaction.user.id
        })
      });

      // GET UPDATED DATA
      const res = await fetch(`${API}/executor?name=${name}`);
      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle(`⚙️ ${name.toUpperCase()}`)
        .setColor(0x5865F2)
        .addFields(
          { name: "🟢 Good", value: String(data.green), inline: true },
          { name: "🟡 Mid", value: String(data.yellow), inline: true },
          { name: "🔴 Bad", value: String(data.red), inline: true },
          { name: "📊 Stability", value: `${data.stability}%` }
        )
        .setFooter({ text: "Executor Rating System" });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

      // AUTO DELETE AFTER 2 MIN
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 120000);

    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "❌ Error while processing vote",
        ephemeral: true
      });
    }
  }
});

// 🛡️ ERROR HANDLING
process.on("unhandledRejection", console.error);

// 🔑 LOGIN
client.login(process.env.TOKEN);
