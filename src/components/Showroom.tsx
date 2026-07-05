/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Veiculo } from "../types.js";
import { Search, SlidersHorizontal, Sparkles, RefreshCw, CheckCircle, Tag, Phone } from "lucide-react";

interface ShowroomProps {
  veiculos: Veiculo[];
  onConsultAi: (veiculo: Veiculo) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Showroom({
  veiculos,
  onConsultAi,
  isLoading,
  onRefresh,
}: ShowroomProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number>(800000);
  const [yearMin, setYearMin] = useState<number>(2018);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(veiculos.flatMap((v) => v.tags || []))
  );

  // Filter vehicles on client side dynamically
  const filteredVeiculos = veiculos.filter((v) => {
    const matchesSearch = 
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag ? v.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()) : true;
    const matchesPrice = v.preco <= priceRange;
    const matchesYear = v.ano >= yearMin;

    return matchesSearch && matchesTag && matchesPrice && matchesYear;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatKM = (val: number) => {
    return val === 0 ? "Zero KM" : `${new Intl.NumberFormat("pt-BR").format(val)} km`;
  };

  // Determine the featured vehicle (defaulting to the first or highest priced vehicle in active list or database)
  const featuredVehicle = veiculos.length > 0 
    ? [...veiculos].sort((a, b) => b.preco - a.preco)[0] 
    : null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Featured Vehicle Split Section (NeoDrive Inspired) */}
      {featuredVehicle && (
        <section className="bg-white border border-gray-200 rounded-none overflow-hidden flex flex-col md:flex-row shadow-minimal">
          {/* Left: Interactive/Visual representation */}
          <div className="w-full md:w-3/5 bg-gray-50 relative overflow-hidden flex items-center justify-center p-8 sm:p-12 border-b md:border-b-0 md:border-r border-gray-200 min-h-[300px]">
            <div className="absolute top-4 left-6 sm:top-12 sm:left-12 pointer-events-none select-none">
              <span className="text-[90px] sm:text-[140px] font-black text-gray-200/60 leading-none tracking-tighter">
                {featuredVehicle.ano}
              </span>
            </div>
            
            <div className="relative z-10 w-full max-w-md">
              <div className="aspect-[16/10] bg-gradient-to-br from-neutral-100 to-neutral-250 border border-gray-300 rounded shadow-sm relative group flex flex-col items-center justify-center p-6 text-center">
                {/* Visual Accent */}
                <div className="w-full h-1/4 bg-black/5 blur-xl mt-24 scale-x-90 rounded-[100%] absolute pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 block">
                    {featuredVehicle.marca}
                  </span>
                  <h3 className="font-display font-light text-2xl text-black uppercase tracking-tight">
                    {featuredVehicle.modelo}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-black text-[9px] font-bold text-white uppercase tracking-widest mt-4">
                    {featuredVehicle.cor || "PREMIUM"}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-12 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-black"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* Right: Specs description */}
          <div className="w-full md:w-2/5 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 italic underline underline-offset-4">
              Destaque Recente
            </span>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-black mb-4">
              {featuredVehicle.marca}{" "}
              <span className="font-bold">{featuredVehicle.modelo}</span>
            </h1>
            
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
              {featuredVehicle.descricaoExperiencia || 
                "Engenharia de precisão com experiência de direção purista e refinada. Um veículo configurado sob os mais altos padrões de estética e mecânica do mercado."}
            </p>

            {/* Structured Specifications list */}
            <div className="grid grid-cols-2 gap-y-5 mb-8 border-t border-gray-100 pt-6">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Ano</div>
                <div className="text-base font-medium text-black">{featuredVehicle.ano}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Quilometragem</div>
                <div className="text-base font-medium text-black">{formatKM(featuredVehicle.quilometragem)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Cor Externa</div>
                <div className="text-base font-medium text-black capitalize">{featuredVehicle.cor || "N/A"}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Classificação</div>
                <div className="text-xs font-mono text-gray-500 uppercase flex flex-wrap gap-1 mt-1">
                  {featuredVehicle.tags.slice(0, 2).map(t => (
                    <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Box with Pricing */}
            <div className="flex items-end justify-between border-t border-gray-100 pt-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Valor</span>
                <span className="text-2xl font-bold text-black">{formatCurrency(featuredVehicle.preco)}</span>
              </div>
              <button
                onClick={() => onConsultAi(featuredVehicle)}
                className="bg-black text-white px-6 py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-900 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Consultar IA</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Control Bar - Ultra Clean minimalism design */}
      <div className="bg-white p-5 border border-gray-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-minimal">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            id="search-input"
            type="text"
            placeholder="PESQUISAR POR MARCA OU MODELO... (EX: PORSCHE, COROLLA)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wider uppercase focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            id="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all ${
              showFilters
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros {showFilters ? "Ativos" : ""}</span>
          </button>

          <button
            id="refresh-showroom"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
            title="Atualizar estoque"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div className="p-6 bg-white border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in shadow-minimal">
          {/* Price Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-500">
              <span>Preço Máximo:</span>
              <span className="text-black">{formatCurrency(priceRange)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={800000}
              step={10000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-black h-1 bg-gray-150 rounded-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-gray-400">
              <span>R$ 50k</span>
              <span>R$ 800k</span>
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-500">
              <span>Ano Mínimo:</span>
              <span className="text-black">{yearMin}</span>
            </div>
            <input
              type="range"
              min={2018}
              max={2023}
              step={1}
              value={yearMin}
              onChange={(e) => setYearMin(Number(e.target.value))}
              className="w-full accent-black h-1 bg-gray-150 rounded-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-gray-400">
              <span>2018</span>
              <span>2023</span>
            </div>
          </div>

          {/* Clean Filters Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTag(null);
                setPriceRange(800000);
                setYearMin(2018);
              }}
              className="w-full py-2.5 border border-dashed border-gray-300 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
            >
              Resetar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Quick Tags Scroll */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">
            Classificações:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
              selectedTag === null
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 capitalize transition-all ${
                selectedTag === tag
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Tag className="w-3 h-3 opacity-60" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Vehicle Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin text-black" />
          <p className="text-xs uppercase tracking-widest">Sincronizando estoque com o servidor...</p>
        </div>
      ) : filteredVeiculos.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 space-y-4 shadow-minimal">
          <p className="text-gray-400 text-xs uppercase tracking-widest">Nenhum veículo corresponde aos filtros aplicados.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedTag(null);
              setPriceRange(800000);
              setYearMin(2018);
            }}
            className="text-[10px] text-black font-bold uppercase tracking-widest border-b border-black hover:opacity-70 transition-opacity"
          >
            Ver catálogo completo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVeiculos.map((v) => (
            <div
              key={v.id}
              className="group bg-white border border-gray-200 flex flex-col justify-between hover:border-black transition-all shadow-minimal hover:scale-[1.005]"
            >
              {/* Box Top Label */}
              <div className="p-5 pb-0 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-400">
                  {v.quilometragem === 0 ? "Novo • Em Trânsito" : "Disponível • Seminovos"}
                </span>
                
                {v.quilometragem < 20000 && (
                  <span className="text-[8px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-100 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    BAIXA KM
                  </span>
                )}
              </div>

              {/* Minimalist Image Placeholder Area */}
              <div className="p-5">
                <div className="h-28 bg-gray-50 border border-gray-150 flex flex-col items-center justify-center font-mono text-center p-4 relative overflow-hidden group-hover:bg-neutral-100/40 transition-colors">
                  <span className="text-gray-300 text-[60px] font-black absolute -bottom-5 select-none pointer-events-none">
                    {v.ano}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] relative z-10 block mb-0.5">
                    {v.marca}
                  </span>
                  <span className="text-xs text-black font-medium uppercase tracking-wide relative z-10 block">
                    {v.modelo}
                  </span>
                </div>
              </div>

              {/* Card Specs Body */}
              <div className="px-5 pb-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Row Metadata */}
                  <div className="grid grid-cols-3 gap-1 py-2 border-y border-gray-100 text-center font-mono text-[9px] text-gray-400 uppercase tracking-wider">
                    <div>
                      <span>Ano</span>
                      <span className="block font-sans font-semibold text-black text-xs mt-0.5">{v.ano}</span>
                    </div>
                    <div className="border-x border-gray-100">
                      <span>KM</span>
                      <span className="block font-sans font-semibold text-black text-xs mt-0.5 truncate px-1">{formatKM(v.quilometragem)}</span>
                    </div>
                    <div>
                      <span>Cor</span>
                      <span className="block font-sans font-semibold text-black text-xs mt-0.5 truncate px-1 capitalize">{v.cor || "Multicor"}</span>
                    </div>
                  </div>

                  {/* Brand and price details */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{v.marca}</span>
                    <span className="text-lg font-bold text-black">{formatCurrency(v.preco)}</span>
                  </div>

                  {/* Experience description snippet */}
                  {v.descricaoExperiencia && (
                    <div className="bg-gray-50/50 p-3 border border-gray-100">
                      <span className="text-[8px] text-black font-bold uppercase tracking-wider block mb-1">
                        Sinal de Experiência / IA:
                      </span>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {v.descricaoExperiencia}
                      </p>
                    </div>
                  )}

                  {/* Tags chips line */}
                  <div className="flex flex-wrap gap-1">
                    {v.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Minimalism CTA buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => onConsultAi(v)}
                    className="flex-1 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Consultar IA</span>
                  </button>
                  <a
                    href={`https://wa.me/5511999999999?text=Olá! Tenho interesse no veículo ${v.marca} ${v.modelo} anunciado.`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 p-3 flex items-center justify-center transition-colors"
                    title="Contato Direto"
                  >
                    <Phone className="w-3.5 h-3.5 text-black" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
