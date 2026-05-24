import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquare, List, BarChart2, Plus, Menu, Zap } from 'lucide-react';
import { useUIStore } from '../store/index.js';
import { v4 as uuidv4 } from 'uuid';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
        } flex-shrink-0 bg-slate-800 border-r border-slate-700 transition-all duration-200 flex flex-col`}
      >
        <div className="p-4 flex items-center gap-2 border-b border-slate-700">
          <Zap size={20} className="text-indigo-400" />
          <span className="font-bold text-slate-100 font-mono">OliveTrace</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => navigate(`/chat/${uuidv4()}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors mb-3"
          >
            <Plus size={18} /> New Chat
          </button>
          <NavItem to="/chat" icon={MessageSquare} label="Chat" />
          <NavItem to="/conversations" icon={List} label="Conversations" />
          <NavItem to="/dashboard" icon={BarChart2} label="Dashboard" />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3">
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-slate-100 transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-slate-400 text-sm">OliveTrace LLM Observability</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
