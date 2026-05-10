import { useState, useRef, useEffect } from "react";
import { chatWithAgriAI, type ChatMessage } from "../../models/services/gemini";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function TanyaAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "model",
    text: "Halo! Saya Agri AI, asisten virtual Anda untuk pertanian bawang merah. Ada yang bisa saya bantu hari ini?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user msg to UI
    const updatedMessages = [...messages, { role: "user", text: userMsg } as ChatMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send to AI (excluding the greeting to save tokens/keep it clean, but let's pass all except the first if it's too long... actually let's pass all)
      const aiResponse = await chatWithAgriAI(updatedMessages.slice(1), userMsg);
      setMessages([...updatedMessages, { role: "model", text: aiResponse }]);
    } catch (err) {
      setMessages([...updatedMessages, { role: "model", text: "Maaf, terjadi kesalahan atau koneksi terputus. Silakan coba lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight" style={{ letterSpacing: "-0.05em" }}>Tanya Agri AI</h1>
        <p className="text-black font-medium mt-1">Konsultasikan masalah pertanian Anda dengan asisten cerdas.</p>
      </div>

      <div className="flex-1 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 border-2 border-black rounded-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-neo-blue' : 'bg-neo-yellow'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <Bot className="w-6 h-6 md:w-7 md:h-7 text-black" />}
              </div>
              <div className={`max-w-[75%] md:max-w-[80%] rounded-xl border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-neo-accent text-white' : 'bg-white text-black'}`}>
                <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none">
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-black rounded-lg bg-neo-yellow flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-black animate-pulse" />
              </div>
              <div className="bg-white text-black rounded-xl border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold">Agri AI sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neo-bg border-t-4 border-black">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya soal perawatan, pupuk, cuaca, dll..."
              className="flex-1 px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-neo-yellow border-2 border-black rounded-xl hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
            >
              <Send className="w-5 h-5 font-bold" />
              <span className="font-black uppercase hidden sm:block">Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
