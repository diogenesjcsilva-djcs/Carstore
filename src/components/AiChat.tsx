/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types.js";
import { Send, Sparkles, Bot, User, HelpCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  clearHistory: () => void;
  errorMsg: string | null;
}

const PRESETS = [
  "Quais são os carros mais econômicos?",
  "Indique um SUV para família grande",
  "O que vocês têm na categoria esportiva?",
  "Tenho orçamento de R$ 150.000, o que recomenda?"
];

export default function AiChat({
  chatHistory,
  onSendMessage,
  isGenerating,
  clearHistory,
  errorMsg,
}: AiChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handlePresetClick = (text: string) => {
    if (isGenerating) return;
    onSendMessage(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto h-[calc(100vh-12rem)] min-h-[550px] animate-fade-in">
      {/* Sidebar Suggestions */}
      <div className="lg:col-span-1 bg-white p-6 border border-gray-200 shadow-minimal flex flex-col justify-between h-full">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-black border-b border-gray-100 pb-3">
            <HelpCircle className="w-3.5 h-3.5 text-black" />
            <span className="font-bold text-[10px] uppercase tracking-widest text-black">
              Sugestões de Venda
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Consulte diretamente o consultor virtual com as simulações prontas abaixo:
          </p>
          <div className="space-y-2 pt-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(p)}
                disabled={isGenerating}
                className="w-full text-left p-3 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:border-black hover:bg-black hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={clearHistory}
            className="w-full py-2.5 bg-gray-50 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-black hover:text-white transition-all cursor-pointer"
          >
            Limpar Conversa
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 bg-white border border-gray-200 shadow-minimal flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xs uppercase tracking-widest text-black leading-tight">
                Consultor de Vendas IA
              </h2>
              <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase block mt-0.5">
                On-line • Respostas em tempo real
              </span>
            </div>
          </div>
        </div>

        {/* Message Container Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
          <AnimatePresence initial={false}>
            {chatHistory.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12"
              >
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black">
                    Como posso conduzir sua escolha?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Possuo dados completos de todo o estoque ativo, incluindo detalhes técnicos, revisões, sensações ao dirigir e preços. Faça uma pergunta ou peça indicações personalizadas.
                  </p>
                </div>
              </motion.div>
            ) : (
              chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.role === "user" 
                      ? "bg-gray-100 border-gray-200 text-black" 
                      : "bg-black border-black text-amber-400"
                  }`}>
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-none text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-black shadow-minimal"
                  }`}>
                    <div className="whitespace-pre-wrap select-text font-sans">
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Typing Loading State */}
          {isGenerating && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
              <div className="w-7 h-7 rounded-full bg-black border border-black flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-none shadow-minimal flex items-center gap-1">
                <span className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Server/Gemini configured error panel */}
          {errorMsg && (
            <div className="p-4 bg-gray-50 border border-gray-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">Conexão IA indisponível</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-[9px] font-mono text-gray-400 mt-1">
                  Nota: Você pode adicionar sua chave de forma segura no menu <strong>Settings &gt; Secrets</strong> do AI Studio.
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Chat Input Form */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chat-input"
              type="text"
              placeholder={isGenerating ? "AGUARDANDO CONSULTOR..." : "ESCREVA SUA MENSAGEM... (EX: QUAL O PREÇO DO PORSCHE?)"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wider uppercase focus:outline-none focus:border-black disabled:opacity-60 transition-colors"
            />
            <button
              id="send-chat"
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="bg-black hover:bg-neutral-900 disabled:bg-gray-100 disabled:text-gray-400 text-white p-3.5 rounded-none transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
