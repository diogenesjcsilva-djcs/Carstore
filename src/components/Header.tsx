/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Car, Sparkles, Settings } from "lucide-react";

interface HeaderProps {
  activeTab: "showroom" | "chat" | "admin";
  setActiveTab: (tab: "showroom" | "chat" | "admin") => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-minimal h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">
        {/* Logo Brand in Clean Minimalism Style */}
        <div 
          onClick={() => setActiveTab("showroom")} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tighter uppercase text-black block leading-none">
              AutoPremium<span className="font-light opacity-60 italic text-gray-500">Motors</span>
            </span>
            <span className="text-[8px] text-gray-400 font-bold tracking-[0.25em] uppercase block mt-1">
              Inteligência Artificial
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Uppercase, Spaced, Minimalist Link style */}
        <nav className="flex items-center gap-1 sm:gap-6">
          <button
            id="tab-showroom"
            onClick={() => setActiveTab("showroom")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "showroom"
                ? "text-black border-black"
                : "text-gray-400 border-transparent hover:text-black"
            }`}
          >
            <span className="hidden sm:inline">Showroom</span>
            <span className="sm:hidden">Vitrine</span>
          </button>

          <button
            id="tab-chat"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "chat"
                ? "text-black border-black"
                : "text-gray-400 border-transparent hover:text-black"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Consultar IA</span>
          </button>

          <button
            id="tab-admin"
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "admin"
                ? "text-black border-black"
                : "text-gray-400 border-transparent hover:text-black"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isAdminLoggedIn ? "Admin" : "Acesso"}</span>
          </button>

          {isAdminLoggedIn && (
            <button
              onClick={onLogout}
              className="ml-2 text-[10px] text-black border border-black hover:bg-black hover:text-white font-bold uppercase tracking-widest px-3 py-1.5 transition-colors"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

