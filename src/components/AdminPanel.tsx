/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Veiculo } from "../types.js";
import { 
  Lock, KeyRound, Plus, Pencil, Trash2, X, Sparkles, 
  TrendingUp, BarChart3, AlertCircle, CheckCircle, Car
} from "lucide-react";

interface AdminPanelProps {
  veiculos: Veiculo[];
  isAdminLoggedIn: boolean;
  onLogin: (username: string, token: string) => void;
  onAddVehicle: (v: Omit<Veiculo, "id" | "dataCadastro">) => Promise<boolean>;
  onEditVehicle: (id: string, v: Partial<Veiculo>) => Promise<boolean>;
  onDeleteVehicle: (id: string) => Promise<boolean>;
  token: string | null;
}

export default function AdminPanel({
  veiculos,
  isAdminLoggedIn,
  onLogin,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  token,
}: AdminPanelProps) {
  // Login fields
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form modal fields
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [preco, setPreco] = useState("");
  const [quilometragem, setQuilometragem] = useState("");
  const [cor, setCor] = useState("");
  const [descricaoExperiencia, setDescricaoExperiencia] = useState("");
  const [tagsInput, setTagsInput] = useState(""); // Comma separated

  // Notification alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro de autenticação.");
      }
      onLogin(data.username, data.token);
      triggerAlert("success", "Autenticado com sucesso! Bem-vindo ao painel admin.");
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const triggerAlert = (type: "success" | "error", text: string) => {
    setAlert({ type, text });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // 2. FORM ACTION HANDLERS
  const openAddModal = () => {
    setEditingVehicleId(null);
    setMarca("");
    setModelo("");
    setAno(new Date().getFullYear().toString());
    setPreco("");
    setQuilometragem("");
    setCor("");
    setDescricaoExperiencia("");
    setTagsInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Veiculo) => {
    setEditingVehicleId(v.id);
    setMarca(v.marca);
    setModelo(v.modelo);
    setAno(v.ano.toString());
    setPreco(v.preco.toString());
    setQuilometragem(v.quilometragem.toString());
    setCor(v.cor || "");
    setDescricaoExperiencia(v.descricaoExperiencia || "");
    setTagsInput(v.tags ? v.tags.join(", ") : "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca.trim() || !modelo.trim() || !preco || !ano) {
      setFormError("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    const tagsArr = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const payload = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: Number(ano),
      preco: Number(preco),
      quilometragem: Number(quilometragem) || 0,
      cor: cor.trim() || "Não especificada",
      descricaoExperiencia: descricaoExperiencia.trim(),
      tags: tagsArr,
    };

    try {
      let success = false;
      if (editingVehicleId) {
        success = await onEditVehicle(editingVehicleId, payload);
        if (success) triggerAlert("success", `Veículo ${modelo} atualizado com sucesso!`);
      } else {
        success = await onAddVehicle(payload);
        if (success) triggerAlert("success", `Novo veículo ${modelo} inserido com sucesso!`);
      }

      if (success) {
        setIsModalOpen(false);
      } else {
        setFormError("Ocorreu um erro ao salvar o veículo. Verifique se sua sessão admin é válida.");
      }
    } catch (err: any) {
      setFormError(err.message || "Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (v: Veiculo) => {
    if (confirm(`Tem certeza que deseja DELETAR o veículo ${v.marca} ${v.modelo} do estoque? Esta ação não pode ser desfeita.`)) {
      const success = await onDeleteVehicle(v.id);
      if (success) {
        triggerAlert("success", `Veículo ${v.modelo} removido com sucesso.`);
      } else {
        triggerAlert("error", "Não foi possível remover o veículo.");
      }
    }
  };

  // 3. STATS CALCULATIONS
  const totalVehicles = veiculos.length;
  const totalValue = veiculos.reduce((sum, v) => sum + v.preco, 0);
  const averagePrice = totalVehicles > 0 ? totalValue / totalVehicles : 0;
  const maxPriceVehicle = veiculos.length > 0 ? [...veiculos].sort((a, b) => b.preco - a.preco)[0] : null;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 shadow-minimal p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-lg uppercase tracking-widest text-black">
            Acesso Restrito
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
            Faça login para gerenciar o estoque ativo e treinar o consultor de vendas IA.
          </p>
        </div>

        {/* Credentials hints container */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-none text-xs space-y-2">
          <p className="font-bold text-[10px] uppercase tracking-widest text-black flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
            <KeyRound className="w-3.5 h-3.5 text-black" />
            Acesso do Revendedor:
          </p>
          <div className="flex justify-between font-mono text-[10px] text-gray-500">
            <span>USER: <strong className="text-black">admin</strong></span>
            <span>PASS: <strong className="text-black">123456</strong></span>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Usuário</label>
            <input
              id="admin-username"
              type="text"
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wider uppercase focus:outline-none focus:border-black"
              placeholder="Digite o usuário"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Senha</label>
            <input
              id="admin-password"
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wider uppercase focus:outline-none focus:border-black"
              placeholder="Digite a senha"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-gray-50 border border-gray-200 text-black text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-black" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-black hover:bg-neutral-900 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
          >
            {isLoggingIn ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    );
  }

  // RENDER COMPLETED ADMIN DASHBOARD
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert Banner notification */}
      {alert && (
        <div className={`p-4 rounded-none border flex items-center gap-3 shadow-minimal max-w-2xl mx-auto animate-fade-in ${
          alert.type === "success" 
            ? "bg-gray-50 border-black text-black" 
            : "bg-gray-50 border-red-500 text-red-800"
        }`}>
          {alert.type === "success" ? <CheckCircle className="w-4 h-4 text-black" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span className="text-xs font-bold uppercase tracking-wider">{alert.text}</span>
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Count */}
        <div className="bg-white p-6 border border-gray-200 shadow-minimal flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-black">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Estoque Ativo</span>
            <span className="font-display font-bold text-xl text-black block mt-0.5">{totalVehicles}</span>
            <span className="text-[9px] text-gray-400 font-medium block">veículos</span>
          </div>
        </div>

        {/* Card 2: Sum */}
        <div className="bg-white p-6 border border-gray-200 shadow-minimal flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-black">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Patrimônio</span>
            <span className="font-display font-bold text-xl text-black block mt-0.5">{formatBRL(totalValue)}</span>
            <span className="text-[9px] text-gray-400 font-medium block">total avaliado</span>
          </div>
        </div>

        {/* Card 3: Avg */}
        <div className="bg-white p-6 border border-gray-200 shadow-minimal flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-black">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Média Geral</span>
            <span className="font-display font-bold text-xl text-black block mt-0.5">{formatBRL(averagePrice)}</span>
            <span className="text-[9px] text-gray-400 font-medium block">por veículo</span>
          </div>
        </div>

        {/* Card 4: High */}
        <div className="bg-white p-6 border border-gray-200 shadow-minimal flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-black">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Mais Valioso</span>
            <span className="font-display font-bold text-sm text-black block truncate mt-0.5">
              {maxPriceVehicle ? maxPriceVehicle.modelo : "Nenhum"}
            </span>
            <span className="font-mono text-xs text-gray-500 block">
              {maxPriceVehicle ? formatBRL(maxPriceVehicle.preco) : "R$ 0"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stock controls table header */}
      <div className="bg-white border border-gray-200 shadow-minimal overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-black">Painel de Gerenciamento</h3>
            <p className="text-[11px] text-gray-400 mt-1">Insira, edite e remova veículos do estoque que abastece o showroom e a IA.</p>
          </div>
          <button
            id="btn-add-vehicle"
            onClick={openAddModal}
            className="px-5 py-2.5 bg-black hover:bg-neutral-950 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inserir Veículo</span>
          </button>
        </div>

        {/* Desktop Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[9px] tracking-widest border-b border-gray-200 font-bold">
                <th className="px-6 py-4">Marca / Modelo</th>
                <th className="px-6 py-4">Ano</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Quilometragem</th>
                <th className="px-6 py-4">Cor</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-black">
              {veiculos.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">
                    <div>
                      <span className="block font-bold text-xs uppercase tracking-wide">{v.modelo}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest">{v.marca}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">{v.ano}</td>
                  <td className="px-6 py-4 font-bold text-black font-mono">{formatBRL(v.preco)}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{v.quilometragem === 0 ? "Zero KM" : `${v.quilometragem.toLocaleString("pt-BR")} km`}</td>
                  <td className="px-6 py-4 capitalize text-gray-600">{v.cor || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {v.tags.map((tag) => (
                        <span key={tag} className="text-[8px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-2 border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-colors"
                        title="Editar veículo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(v)}
                        className="p-2 border border-gray-250 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Remover veículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Slide-over/Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-2xl w-full border border-gray-200 shadow-xl overflow-hidden rounded-none">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                  {editingVehicleId ? "Editar Veículo no Estoque" : "Inserir Novo Veículo"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1.5 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Marca *</label>
                  <input
                    type="text"
                    required
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs uppercase tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: Toyota, Porsche"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs uppercase tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: Corolla Altis Hybrid, 911"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Ano *</label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2027}
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: 2021"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Preço (R$) *</label>
                  <input
                    type="number"
                    required
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: 145000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Quilometragem (km)</label>
                  <input
                    type="number"
                    value={quilometragem}
                    onChange={(e) => setQuilometragem(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: 28000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Cor</label>
                  <input
                    type="text"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs uppercase tracking-wide focus:outline-none focus:border-black"
                    placeholder="Ex: Branco Pérola, Preto"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Tags de Classificação</label>
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Separadas por vírgula</span>
                </div>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs uppercase tracking-wide focus:outline-none focus:border-black"
                  placeholder="Ex: automatico, economico, familia, esportivo, suv"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                    Descrição de Experiência (IA)
                  </label>
                  <span className="text-[9px] text-black font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Alimenta o Chatbot
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={descricaoExperiencia}
                  onChange={(e) => setDescricaoExperiencia(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-xs focus:outline-none focus:border-black resize-none"
                  placeholder="Descreva sensações ao dirigir, exclusividade, opcionais premium, histórico de revisões... Detalhes profundos que a busca não pega mas que a IA usará para vender o carro!"
                />
              </div>

              {formError && (
                <div className="p-3 bg-gray-50 border border-red-500 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Footer actions */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Gravando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
