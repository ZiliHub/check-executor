```js
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📊 DATA
const executors = {
  "synapse x": { status: "🟢 FULL SUPPORT", stability: "99%" },
  "script-ware": { status: "🟢 FULL SUPPORT", stability: "98%" },
  "krnl": { status: "🟢 STABLE", stability: "90%" },
  "fluxus": { status: "🟡 LIMITED", stability: "75%" },
  "oxygen u": { status: "🟡 LIMITED", stability: "70%" },
  "jjsploit": { status: "🔴 NOT RECOMMENDED", stability: "20%" }
};

// 🧠 FUZZY MATCH (auto detect gần đúng)
function findClosest(input) {
  input = input.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (let key in executors) {
    let score = 0;
    for (let char of input) {
      if (key.includes(char)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  return bestMatch;
}

client.once('ready', () => {
  console.log(`Online: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

  // 🎮 BUTTON
  if (interaction.isButton()) {

    if (interaction.customId === "check") {
      const modal = new ModalBuilder()
        .setCustomId("modal_check")
        .setTitle("🔍 Check Executor");

      const input = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Enter executor name")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    if (interaction.customId === "menu") {
      const select = new StringSelectMenuBuilder()
        .setCustomId("select_executor")
        .setPlaceholder("🎮 Choose executor...")
        .addOptions(
          Object.keys(executors).map(e => ({
            label: e,
            value: e
          }))
        );

      await interaction.reply({
        content: "🎮 Select executor:",
        components: [new ActionRowBuilder().addComponents(select)],
        ephemeral: true
      });
    }
  }

  // 🎮 DROPDOWN SELECT
  if (interaction.isStringSelectMenu()) {
    const name = interaction.values[0];
    const data = executors[name];

    await interaction.reply({
      content: `\`\`\`
Executor : ${name}
Status   : ${data.status}
Stability: ${data.stability}
\`\`\``,
      ephemeral: true
    });
  }

  // 🔍 MODAL SUBMIT
  if (interaction.isModalSubmit()) {
    let name = interaction.fields.getTextInputValue("name");

    let found = executors[name.toLowerCase()];
    if (!found) {
      const closest = findClosest(name);
      found = executors[closest];

      await interaction.reply({
        content: `⚠️ Not exact match\n👉 Did you mean: **${closest}**?\n\nStatus: ${found.status}\nStability: ${found.stability}`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `✅ Found: **${name}**\nStatus: ${found.status}\nStability: ${found.stability}`,
        ephemeral: true
      });
    }
  }
});

// 🚀 SEND PANEL
client.on('ready', async () => {
  const channel = await client.channels.fetch("1488456249900142645");

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("check")
      .setLabel("🔍 Check Executor")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("menu")
      .setLabel("🎮 Open Menu")
      .setStyle(ButtonStyle.Secondary)
  );

  channel.send({
    content: "⚙️ **EXECUTOR CONTROL PANEL**",
    components: [buttons]
  });
});

client.login(process.env.TOKEN);
```
