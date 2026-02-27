import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppStore } from '../../store/useAppStore';
import { generateStandardContent } from '../../services/gemini';
import { Loader2, Send, Bot, User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const SmartAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast } = useAppStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Build context from history
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const prompt = `
        You are an elite B2B LinkedIn Strategist and Content Creator.
        You are chatting with a user to help them with their LinkedIn presence.
        
        Please respond in ${language === 'ar' ? 'Arabic' : 'English'}.
        
        Conversation History:
        ${history}
        
        User: ${text}
        Assistant:
      `;
      
      const response = await generateStandardContent(prompt);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      addToast('toast.apiError', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    'smartAssistant.quickAction1',
    'smartAssistant.quickAction2',
    'smartAssistant.quickAction3'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">{t('smartAssistant.title')}</h2>
        <p className="text-sm lg:text-base text-slate-500">{t('smartAssistant.subtitle')}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 lg:space-y-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base lg:text-lg font-medium text-slate-800">How can I help you today?</h3>
              <p className="text-sm lg:text-base text-slate-500 max-w-sm">Ask me anything about LinkedIn strategy, content creation, or profile optimization.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {quickActions.map(action => (
                <button
                  key={action}
                  onClick={() => handleSend(t(action))}
                  className="px-3 py-1.5 lg:px-4 lg:py-2 bg-white border border-slate-200 rounded-full text-xs lg:text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  {t(action)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={cn("flex gap-3 lg:gap-4 max-w-4xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-600"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 lg:w-5 lg:h-5" /> : <Bot className="w-4 h-4 lg:w-5 lg:h-5" />}
              </div>
              <div className={cn(
                "px-4 py-3 lg:px-6 lg:py-4 rounded-2xl max-w-[85%] lg:max-w-[80%]",
                msg.role === 'user' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 shadow-sm"
              )}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm lg:text-base">{msg.content}</p>
                ) : (
                  <div className={cn("prose prose-sm max-w-none", language === 'ar' ? 'prose-rtl' : '')}>
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 lg:gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="px-4 py-3 lg:px-6 lg:py-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs lg:text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 lg:p-6 border-t border-slate-100 bg-white rounded-b-2xl">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={t('smartAssistant.placeholder')}
            className={cn(
              "w-full py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm lg:text-base",
              language === 'ar' ? 'pr-4 pl-12 lg:pr-6 lg:pl-14' : 'pl-4 pr-12 lg:pl-6 lg:pr-14'
            )}
            dir="auto"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors",
              language === 'ar' ? 'left-2' : 'right-2 lg:right-2',
              input.trim() && !isLoading ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", language === 'ar' ? '-ml-0.5 rotate-180' : 'ml-0.5')} />
          </button>
        </div>
      </div>
    </div>
  );
};
