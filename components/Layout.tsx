
import React from 'react';
import { 
  Box, 
  Search, 
  GitFork, 
  History, 
  Settings, 
  Bell, 
  Plus, 
  Compass, 
  Database,
  Cpu
} from 'lucide-react';

export type ViewType = 'discover' | 'my-parts' | 'forks' | 'changesets' | 'settings' | 'repo';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: ViewType }) => (
    <button 
      onClick={() => onNavigate(view)}
      className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${activeView === view ? 'bg-[#161b22] text-white' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-white'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:inline font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-[#30363d] flex flex-col bg-[#010409]">
        <div className="p-4 flex items-center gap-3 border-b border-[#30363d] cursor-pointer" onClick={() => onNavigate('discover')}>
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <span className="hidden md:inline font-bold text-xl tracking-tight text-white">CADIT</span>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavItem icon={Compass} label="Discover" view="discover" />
          <NavItem icon={Box} label="My Parts" view="my-parts" />
          
          <div className="pt-4 pb-2 px-3">
            <span className="hidden md:inline text-[10px] font-bold text-[#484f58] uppercase tracking-widest">Collaborations</span>
          </div>
          <NavItem icon={GitFork} label="Forks" view="forks" />
          <NavItem icon={History} label="Changesets" view="changesets" />
        </nav>

        <div className="p-4 border-t border-[#30363d] space-y-4">
          <button 
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-3 w-full transition-colors ${activeView === 'settings' ? 'text-white' : 'text-[#8b949e] hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden md:inline">Settings</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Jane Doe</p>
              <p className="text-xs text-[#8b949e] truncate">Senior Engineer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#30363d] flex items-center justify-between px-6 bg-[#0d1117]/80 backdrop-blur-md z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input 
                type="text" 
                placeholder="Search parametric repositories (e.g. 'nema mount')" 
                className="w-full bg-[#010409] border border-[#30363d] rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-[#484f58]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#8b949e] hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0d1117]"></span>
            </button>
            <button 
              onClick={() => onNavigate('settings')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Repo</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
};
