```js
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📊 DATA
const executors = {
  "volt": { status: "🟢 FULL SUPPORT", stability: 100 },
  "arceusX": { status: "🟢 FULL SUPPORT", stability: 100 },
  "delta": { status: "🟢 FULL SUPPORT", stability: 98 },
  "potassium": { status: "🟢 FULL SUPPORT", stability: 99 },
  "cosmic": { status: "🟢 FULL SUPPORT", stability: 99 },
  "synapse z": { status: "🟢 FULL SUPPORT", stability: 100 },

  "wave": { status: "🟡 LIMITED", stability: 75 },
  "isaeva": { status: "🟡 LIMITED", stability: 70 },
  "velocity": { status: "🟡 LIMITED", stability: 72 },
  "codex": { status: "🟡 LIMITED", stability: 68 },

  "xeno": { status: "🔴 NOT RECOMMENDED", stability: 40 },
  "solara": { status: "🔴 NOT RECOMMENDED", stability: 35 },
  "seliware": { status: "🔴 NOT RECOMMENDED", stability: 30 },

  "sirhurt": { status: "⚪ UNKNOWN", stability: 50 },
  "bunni.fun": { status: "⚪ UNKNOWN", stability: 50 },
  "volcano": { status: "⚪ UNKNOWN", stability: 50 },
  "vega x": { status: "⚪ UNKNOWN", stability: 50 }
};

// 🧠 AI AUTO ĐÁNH GIÁ
function aiReview(data) {
  if (data.stability >= 95) return "🔥 Extremely Stable - Recommended for heavy usage";
  if (data.stability >= 80) return "✅ Stable - Good for most scripts";
  if (data.stability >= 60) return "⚠️ Medium - Some features may fail";
  if (data.stability >= 40) return "❌ Unstable - Not recommended";
  return "💀 Risky - Avoid using";
}

// 🎨 COLOR
function getColor(status) {
  if (status.includes("🟢")) return 0x00ff99;
  if (status.includes("🟡")) return 0xffcc00;
  if (status.includes("🔴")) return 0xff3333;
  return 0x999999;
}

// 📊 FULL TABLE EMBED
function createFullEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("📊 EXECUTOR DATABASE")
    .setColor(0x5865F2);

  for (let name in executors) {
    const data = executors[name];
    embed.addFields({
      name: `⚙️ ${name.toUpperCase()}`,
      value: `${data.status}\n📊 Stability: ${data.stability}%`,
      inline: true
    });
  }

  return embed;
}

// 🏆 LEADERBOARD
function createLeaderboard() {
  const sorted = Object.entries(executors)
    .sort((a, b) => b[1].stability - a[1].stability)
    .slice(0, 5);

  return new EmbedBuilder()
    .setTitle("🏆 TOP EXECUTORS")
    .setColor(0xFFD700)
    .setDescription(
      sorted.map((e, i) =>
        `#${i + 1} **${e[0]}** - ${e[1].stability}%`
      ).join("\n")
    );
}

// 🔍 EMBED DETAIL
function createDetail(name, data) {
  return new EmbedBuilder()
    .setTitle(`⚙️ ${name.toUpperCase()}`)
    .setColor(getColor(data.status))
    .addFields(
      { name: "Status", value: data.status, inline: true },
      { name: "Stability", value: data.stability + "%", inline: true },
      { name: "AI Review", value: aiReview(data) }
    );
}

// READY
client.once('ready', async () => {
  console.log(`✅ Online: ${client.user.tag}`);

  const channel = await client.channels.fetch("YOUR_CHANNEL_ID");

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("check")
      .setLabel("🔍 Check Executor")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("menu")
      .setLabel("📊 Full Database")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("top")
      .setLabel("🏆 Leaderboard")
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: "⚙️ **EXECUTOR CONTROL PANEL v3**",
    components: [buttons]
  });
});

// INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isButton()) {

    // 🔍 CHECK
    if (interaction.customId === "check") {
      const modal = new ModalBuilder()
        .setCustomId("modal_check")
        .setTitle("Check Executor");

      const input = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Enter executor")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // 📊 FULL LIST
    if (interaction.customId === "menu") {
      const msg = await interaction.reply({
        embeds: [createFullEmbed()],
        ephemeral: true
      });

      setTimeout(() => interaction.deleteReply(), 120000);
    }

    // 🏆 LEADERBOARD
    if (interaction.customId === "top") {
      await interaction.reply({
        embeds: [createLeaderboard()],
        ephemeral: true
      });

      setTimeout(() => interaction.deleteReply(), 120000);
    }
  }

  // 🔍 MODAL
  if (interaction.isModalSubmit()) {
    const input = interaction.fields.getTextInputValue("name").toLowerCase();

    const data = executors[input];

    if (!data) {
      return interaction.reply({
        content: "❌ Not found",
        ephemeral: true
      });
    }

    await interaction.reply({
      embeds: [createDetail(input, data)],
      ephemeral: true
    });

    setTimeout(() => interaction.deleteReply(), 120000);
  }
});

client.login(process.env.TOKEN);
process.on('unhandledRejection', console.error);
```
