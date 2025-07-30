const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.askChatbot = async (req, res) => {
  const { question } = req.body;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: question }]
    });
    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
