import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Shield, Code, Cpu, User, Bot, Loader2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ShadowCoderService, Message } from './services/shadowCoder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [service] = useState(() => new ShadowCoderService());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const stream = service.sendMessageStream(userMessage);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'خطأ: فشل الاتصال بـ ShadowCoder-X. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col technical-grid" dir="rtl">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-tight flex items-center gap-2">
                SHADOWCODER-X <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">v1.0.0</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                تم التطوير بواسطة محمد ربيع (Hunter)
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-500/50" />
              <span>وضع آمن</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code className="w-3 h-3 text-emerald-500/50" />
              <span>متعدد اللغات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-emerald-500/50" />
              <span>محسن الأداء</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-6">
              <div className="inline-block p-4 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4">
                <Terminal className="w-12 h-12 text-emerald-400 opacity-50" />
              </div>
              <h2 className="text-3xl font-serif italic text-zinc-200">تم تهيئة النظام.</h2>
              <p className="text-zinc-500 max-w-md mx-auto font-mono text-xs leading-relaxed uppercase tracking-wider">
                ShadowCoder-X جاهز لتصميم البرمجيات، التنفيذ، تصحيح الأخطاء، وتعزيز الأمن السيبراني.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right max-w-3xl mx-auto mt-12">
                {[
                  { title: "تصميم البرمجيات", icon: Code, desc: "هندسة أنظمة قابلة للتوسع وسهلة الصيانة." },
                  { title: "تدقيق أمني", icon: Shield, desc: "تحديد الثغرات واقتراح حلول لتعزيز الحماية." },
                  { title: "تحسين الأداء", icon: Cpu, desc: "إعادة هيكلة الكود لتحقيق أقصى قدر من الكفاءة." }
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-zinc-800 bg-zinc-900/50 rounded-lg hover:border-emerald-500/30 transition-colors group">
                    <item.icon className="w-5 h-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{item.title}</h3>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-4 group",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded shrink-0 flex items-center justify-center border",
                msg.role === 'user' 
                  ? "bg-zinc-800 border-zinc-700" 
                  : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Bot className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              
              <div className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "items-start" : "items-start"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {msg.role === 'user' ? 'المشغل' : 'ShadowCoder-X'}
                  </span>
                  <span className="text-[10px] text-zinc-700 font-mono">
                    [{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                </div>
                
                <div className={cn(
                  "p-4 rounded-lg border text-sm",
                  msg.role === 'user' 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300" 
                    : "bg-zinc-950/50 border-zinc-800 text-zinc-300 shadow-xl"
                )}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.role === 'model' && msg.text === '' && isLoading && (
                    <div className="flex items-center gap-2 text-emerald-500/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">جاري المعالجة...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-emerald-500 group-focus-within:-translate-x-1 transition-transform rotate-180" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="أدخل أمراً أو استفساراً..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-4 pr-12 pl-16 text-sm font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600 text-right"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span>الحالة: متصل</span>
              <span>زمن الاستجابة: 42ms</span>
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>TSX/React</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
