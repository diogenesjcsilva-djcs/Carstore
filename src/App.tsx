/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Showroom from "./components/Showroom.jsx";
import AiChat from "./components/AiChat.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { Veiculo, ChatMessage } from "./types.js";

export default function App() {
  const [activeTab, setActiveTab] = useState<"showroom" | "chat" | "admin">("showroom");
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // 1. HYDRATE VEHICLE INVENTORY ON LOAD
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/veiculos");
      if (response.ok) {
        const data = await response.json();
        setVeiculos(data);
      } else {
        console.error("Falha ao buscar estoque.");
      }
    } catch (err) {
      console.error("Erro ao conectar com a API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Recover admin session if available (optional)
    const savedToken = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");
    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(savedUser);
      setIsAdminLoggedIn(true);
    }
  }, []);

  // 2. AUTHENTICATION HELPERS
  const handleLogin = (username: string, token: string) => {
    setAdminToken(token);
    setAdminUser(username);
    setIsAdminLoggedIn(true);
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", username);
  };

  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (err) {
        console.error("Erro ao fazer logout no servidor:", err);
      }
    }
    setAdminToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setActiveTab("showroom");
  };

  // 3. VEHICLE CRUD OPERATION WIRING
  const handleAddVehicle = async (v: Omit<Veiculo, "id" | "dataCadastro">): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch("/api/veiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(v),
      });

      if (response.ok) {
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao adicionar veículo:", err);
      return false;
    }
  };

  const handleEditVehicle = async (id: string, v: Partial<Veiculo>): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(v),
      });

      if (response.ok) {
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao editar veículo:", err);
      return false;
    }
  };

  const handleDeleteVehicle = async (id: string): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao deletar veículo:", err);
      return false;
    }
  };

  // 4. CHAT OPERATION WIRING (GEMINI)
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setIsGenerating(true);
    setChatError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Houve um problema na comunicação com a IA.");
      }

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setChatHistory((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error("Erro no chat IA:", err);
      setChatError(err.message || "Erro de conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    setChatError(null);
  };

  // Showroom triggers consultation of a specific vehicle
  const handleConsultAi = (veiculo: Veiculo) => {
    const prefilledPrompt = `Olá! Vi o veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano}) anunciado por ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(veiculo.preco)} no estoque. O que você pode me falar sobre a experiência de dirigir ele, seus diferenciais e por que ele é uma boa compra?`;
    
    // Switch to Chat tab
    setActiveTab("chat");
    
    // Directly submit prompt
    handleSendMessage(prefilledPrompt);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-between">
      <div className="space-y-8 pb-16">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
        />

        {/* Dynamic Tab Body */}
        <main className="w-full max-w-7xl mx-auto px-6 sm:px-8">
          {activeTab === "showroom" && (
            <Showroom
              veiculos={veiculos}
              onConsultAi={handleConsultAi}
              isLoading={isLoading}
              onRefresh={fetchInventory}
            />
          )}

          {activeTab === "chat" && (
            <AiChat
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              clearHistory={clearChatHistory}
              errorMsg={chatError}
            />
          )}

          {activeTab === "admin" && (
            <AdminPanel
              veiculos={veiculos}
              isAdminLoggedIn={isAdminLoggedIn}
              onLogin={handleLogin}
              onAddVehicle={handleAddVehicle}
              onEditVehicle={handleEditVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              token={adminToken}
            />
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 sm:px-12 text-[9px] uppercase tracking-[0.2em] font-medium text-gray-400 shrink-0 mt-12">
        <div className="flex gap-4 sm:gap-8">
          <span>AutoPremium SA</span>
          <span className="hidden md:inline">São Paulo, BR</span>
        </div>
        <div className="flex gap-4 sm:gap-8">
          <span className="text-black hidden sm:inline">IA de Vendas • Atendimento 24/7</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
