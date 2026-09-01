'use client';

import React, { useState } from 'react';
import { useAi } from '@/hooks/useAi';
import { ChatMessage } from '@/types/ai.types';
import { Button } from '@/components/ui/Button';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'Bagaimana cara mengurangi bocor halus kopi & admin bank?',
  'Apakah rasio tabungan saya bulan ini sudah ideal?',
  'Bantu buatkan alokasi 50/30/20 dari sisa pemasukan saya.',
  'Kategori mana yang paling boros dan butuh dievaluasi?',
];

export function AiAdvisorChatBox() {
  const { chatWithAdvisor, isChatting } = useAi();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya asisten Certified Financial Planner (CFP) AI kamu. Saya siap menganalisis arus kas, mendeteksi bocor halus, dan merancang strategi penghematan terbaik untuk kamu. Ada yang ingin kamu diskusikan hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isChatting) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const replyText = await chatWithAdvisor(userMsg.text);
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: 'Maaf, terjadi gangguan koneksi ke AI Advisor. Silakan coba sesaat lagi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">AI Financial Advisor</h3>
            <p className="text-[11px] text-muted-foreground">Konsultasi interaktif & strategi berhemat cerdas</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Online
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}>
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  isAi
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                }`}
              >
                {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-2.5 text-xs max-w-[82%] leading-relaxed ${
                  isAi
                    ? 'bg-muted/70 text-foreground border border-border/50'
                    : 'bg-primary text-primary-foreground font-medium'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`block text-[9px] mt-1 ${isAi ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isChatting && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground italic pl-11">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            <span>AI Advisor sedang menganalisis data dan mengetik...</span>
          </div>
        )}
      </div>

      {/* Suggestion Pills */}
      <div className="px-4 py-2 border-t bg-muted/20 flex gap-2 overflow-x-auto no-scrollbar">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            className="flex-1 h-10 rounded-xl border border-input bg-background px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tanyakan analisis keuangan atau tips berhemat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatting}
          />
          <Button type="submit" variant="gradient" size="sm" className="h-10 px-4" disabled={!input.trim() || isChatting}>
            {isChatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
