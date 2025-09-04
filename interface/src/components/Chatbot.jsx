import { useState } from "react";

const Chatbot = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      // ✅ Call your local Ollama API instead of Hugging Face
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral", // change to your installed Ollama model (e.g. "llama3", "phi3", etc.)
          prompt: question,
          stream: false, // return full text in one go
        }),
      });

      const data = await response.json();
      console.log("Ollama response:", data);

      if (data.response) {
        setAnswer(data.response);
      } else {
        setAnswer("⚠️ Model did not return a valid response.");
      }
    } catch (err) {
      console.error(err);
      setAnswer("❌ Error connecting to Ollama. Make sure it's running.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🤖 Chatbot</h2>

      <textarea
        className="w-full border rounded p-2 mb-3"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask me anything..."
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-gray-800">
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
