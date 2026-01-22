import express from "express";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/chatbot", async (req, res) => {
  const question = (req.body?.question || "").trim();
  if (!question) return res.json({ answer: "Question vide." });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Tu es un assistant du SEUQAM qui vulgarise la convention collective clairement. Si tu n’es pas sûr, dis-le et invite à contacter le syndicat."
          },
          { role: "user", content: question }
        ]
      })
    });

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content || "Erreur OpenAI.";
    res.json({ answer });
  } catch (e) {
    res.json({ answer: "Erreur serveur (connexion à OpenAI)." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Chatbot actif sur port", port));
