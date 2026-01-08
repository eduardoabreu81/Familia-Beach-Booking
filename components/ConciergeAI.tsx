import React, { useState } from 'react';
import { getTravelAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const ConciergeAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Eu sou o assistente virtual da casa de praia. Precisa de dicas do que levar, onde comer ou previsão do tempo?' }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const advice = await getTravelAdvice(userMsg, "Localização: Praia ensolarada, perto de quiosques, apto 101 térreo com jardim, apto 202 com varanda e vista mar.");
    
    setChatHistory(prev => [...prev, { role: 'model', text: advice }]);
    setLoading(false);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${isOpen ? 'w-full max-w-sm' : 'w-auto'}`}>
      
      {isOpen && (
        <div className="bg-white w-full rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">Concierge de Praia</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>

          <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl border border-slate-100 rounded-bl-none flex items-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" /> Pensando...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo..."
              className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">{isOpen ? 'Fechar' : 'Ajuda na Viagem?'}</span>
      </button>
    </div>
  );
};

export default ConciergeAI;