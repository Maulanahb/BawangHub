import { useState, useRef, useEffect } from "react";
import { chatWithAgriAI, type ChatMessage } from "../../models/services/gemini";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
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
      // Send to AI — pass history WITHOUT the latest user msg (slice off last), since apiChat appends userMsg separately
      const historyForAI = updatedMessages.slice(1, -1); // skip greeting + skip last user msg
      const aiResponse = await chatWithAgriAI(historyForAI, userMsg);
      setMessages([...updatedMessages, { role: "model", text: aiResponse }]);
    } catch (err) {
      setMessages([...updatedMessages, { role: "model", text: "Maaf, terjadi kesalahan atau koneksi terputus. Silakan coba lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-6 md:p-8 relative shadow-sm overflow-hidden mb-6 flex items-center justify-between shrink-0">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight">Tanya Agri AI</h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Konsultasikan masalah pertanian Anda dengan asisten cerdas yang selalu siap membantu kapan saja.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Sparkles className="w-48 h-48 text-gray-900" />
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex w-full gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <>
                  <div className="max-w-[75%] md:max-w-[80%] rounded-2xl p-4 bg-agri-green-light text-agri-green-dark">
                    <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.text}
                    </div>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 bg-agri-green text-white">
                    <User className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                    <Bot className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div className="max-w-[75%] md:max-w-[80%] rounded-2xl p-4 bg-gray-50 text-gray-800">
                    <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none text-gray-800">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-amber-600 animate-pulse" />
              </div>
              <div className="bg-gray-50 text-gray-800 rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span className="font-semibold text-sm">Agri AI sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya soal perawatan, pupuk, cuaca, dll..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-agri-green focus:ring-1 focus:ring-agri-green transition-all font-medium disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-agri-green text-white rounded-xl hover:bg-agri-green-dark transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="font-semibold hidden sm:block">
                {isLoading ? 'Mengirim...' : 'Kirim'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
