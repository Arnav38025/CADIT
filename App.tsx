
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, ViewType } from './components/Layout';
import { MOCK_REPOS, MATERIALS } from './mockData';
import { CADRepository, Parameter, AIModificationResult, ActiveAdjustFeedback, PhysicsStats, ManufacturingAudit } from './types';
import { ThreeDViewer } from './components/ThreeDViewer';
import { modifyParametricModel, analyzeActiveAdjust, runManufacturingAudit, calculatePhysics } from './services/geminiService';
import { 
  Star, GitFork, Eye, ChevronRight, ShieldAlert, Wand2, Activity, History, Info, 
  Layers, Check, X, Loader2, Database, Crosshair, Zap, Hammer, AlertTriangle,
  Beaker, Truck, FileText, Share2, Box, MousePointer2, Thermometer, Ruler, User, Clock, Settings as SettingsIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('discover');
  const [allRepos, setAllRepos] = useState<CADRepository[]>(MOCK_REPOS);
  const [repoTab, setRepoTab] = useState<'inspect' | 'activeAdjust' | 'physics' | 'mfg'>('inspect');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<AIModificationResult | null>(null);
  const [activeRepo, setActiveRepo] = useState<CADRepository | null>(null);
  const [wireframe, setWireframe] = useState(false);

  // Feature states
  const [assemblyContext, setAssemblyContext] = useState('');
  const [activeFeedback, setActiveFeedback] = useState<ActiveAdjustFeedback | null>(null);
  const [physics, setPhysics] = useState<PhysicsStats | null>(null);
  const [audit, setAudit] = useState<ManufacturingAudit | null>(null);
  const [isLoadingFeature, setIsLoadingFeature] = useState(false);

  const currentUser = "Jane Doe";

  const currentMaterial = useMemo(() => 
    MATERIALS.find(m => m.id === activeRepo?.currentMaterialId) || MATERIALS[0]
  , [activeRepo]);

  const handleSelectRepo = (repoId: string) => {
    const repo = allRepos.find(r => r.id === repoId);
    if (repo) {
      setActiveRepo(JSON.parse(JSON.stringify(repo)));
      setActiveView('repo');
      setRepoTab('inspect');
      resetFeatures();
    }
  };

  const handleFork = () => {
    if (!activeRepo) return;
    const newFork: CADRepository = {
      ...JSON.parse(JSON.stringify(activeRepo)),
      id: `fork-${Date.now()}`,
      owner: currentUser,
      author: currentUser,
      forkedFrom: activeRepo.name,
      updatedAt: new Date().toISOString(),
      stars: 0,
      forksCount: 0,
      history: [{
        id: `fork-commit-${Date.now()}`,
        author: currentUser,
        timestamp: new Date().toISOString(),
        message: `Forked from ${activeRepo.owner}/${activeRepo.name}`,
        hash: Math.random().toString(36).substring(7),
        parametersSnapshot: [...activeRepo.parameters]
      }, ...activeRepo.history]
    };
    setAllRepos([newFork, ...allRepos]);
    setActiveRepo(newFork);
    alert(`Repository ${activeRepo.name} forked successfully!`);
  };

  const resetFeatures = () => {
    setActiveFeedback(null);
    setPhysics(null);
    setAudit(null);
    setPendingChanges(null);
  };

  const handleAiModify = async () => {
    if (!aiPrompt || !activeRepo) return;
    setIsAiLoading(true);
    try {
      const result = await modifyParametricModel(aiPrompt, activeRepo.parameters, activeRepo.intent);
      setPendingChanges(result);
    } catch (error) { alert("AI modification failed."); }
    finally { setIsAiLoading(false); }
  };

  const handleRunFeature = async (tab: typeof repoTab) => {
    if (!activeRepo) return;
    setRepoTab(tab);
    setIsLoadingFeature(true);
    try {
      if (tab === 'physics') {
        const stats = await calculatePhysics(activeRepo.parameters, currentMaterial);
        setPhysics(stats);
      } else if (tab === 'mfg') {
        const result = await runManufacturingAudit(activeRepo.parameters, currentMaterial);
        setAudit(result);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingFeature(false); }
  };

  const applyChanges = () => {
    if (!pendingChanges || !activeRepo) return;
    const newRepo = { ...activeRepo };
    newRepo.parameters = pendingChanges.updatedParameters;
    newRepo.history = [{
      id: `c-${Date.now()}`, author: currentUser, timestamp: new Date().toISOString(),
      message: `AI Mod: ${aiPrompt.slice(0, 30)}...`, hash: Math.random().toString(36).substring(7),
      parametersSnapshot: [...activeRepo.parameters]
    }, ...activeRepo.history];
    
    // Update both local active repo and the global list
    setActiveRepo(newRepo);
    setAllRepos(allRepos.map(r => r.id === newRepo.id ? newRepo : r));
    setPendingChanges(null);
    setAiPrompt('');
  };

  // Sub-views
  const RepoCard = ({ repo }: { repo: CADRepository }) => (
    <div 
      onClick={() => handleSelectRepo(repo.id)} 
      className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-white group-hover:text-blue-400">{repo.name}</h3>
        </div>
        {repo.forkedFrom && (
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">Fork</span>
        )}
      </div>
      <p className="text-sm text-[#8b949e] line-clamp-2 mb-4 h-10 leading-relaxed">{repo.description}</p>
      <div className="flex items-center justify-between border-t border-[#30363d] pt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">{repo.author[0]}</div>
          <span className="text-xs text-[#8b949e]">{repo.author}</span>
        </div>
        <span className="text-[10px] text-[#484f58] uppercase font-bold">{repo.geometryType}</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'discover':
        return (
          <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Community Hub</h1>
              <p className="text-[#8b949e]">The world's first open-source hardware registry with AI-native parametric control.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRepos.filter(r => r.owner !== currentUser).map(repo => <RepoCard key={repo.id} repo={repo} />)}
            </div>
          </div>
        );
      case 'my-parts':
        const myParts = allRepos.filter(r => r.owner === currentUser && !r.forkedFrom);
        return (
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">My Parts</h2>
            {myParts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myParts.map(repo => <RepoCard key={repo.id} repo={repo} />)}
              </div>
            ) : <p className="text-[#484f58]">No private parts found. Start by creating a new repo.</p>}
          </div>
        );
      case 'forks':
        const forks = allRepos.filter(r => r.owner === currentUser && r.forkedFrom);
        return (
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">My Forks</h2>
            {forks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forks.map(repo => <RepoCard key={repo.id} repo={repo} />)}
              </div>
            ) : <p className="text-[#484f58]">You haven't forked any designs yet.</p>}
          </div>
        );
      case 'changesets':
        const allCommits = allRepos.flatMap(r => r.history.map(c => ({...c, repoName: r.name, repoId: r.id})))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return (
          <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">Recent Changesets</h2>
            <div className="space-y-4">
              {allCommits.map(commit => (
                <div 
                  key={commit.id} 
                  onClick={() => handleSelectRepo(commit.repoId)}
                  className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg flex items-center justify-between hover:border-blue-500/40 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded text-blue-400"><History className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">{commit.message}</div>
                      <div className="text-xs text-[#8b949e]">{commit.repoName} • {new Date(commit.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#484f58] font-bold uppercase mono">{commit.hash}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 max-w-2xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" /> Platform Settings
              </h2>
              <p className="text-[#8b949e]">Configure your CADIT workspace and engineering preferences.</p>
            </div>
            
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase text-[#484f58]">API Configuration</h3>
                <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white font-medium">Gemini AI Model</span>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">gemini-3-flash-preview</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white font-medium">API Health Status</span>
                    <span className="text-xs text-blue-400 font-bold">OPTIMAL</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase text-[#484f58]">Engineering Preferences</h3>
                <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Default Unit System</span>
                    <select className="bg-[#010409] border border-[#30363d] text-xs text-white rounded px-2 py-1">
                      <option>Metric (mm)</option>
                      <option>Imperial (in)</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">DFM Confidence Threshold</span>
                    <input type="range" className="accent-blue-500 h-1" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        );
      case 'repo':
        if (!activeRepo) return null;
        return (
          <div className="flex flex-col h-full bg-[#0d1117]">
            {/* Main Workspace Header */}
            <div className="px-6 py-3 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <Database className="w-4 h-4" />
                  <span className="text-sm hover:text-white cursor-pointer" onClick={() => setActiveView('discover')}>{activeRepo.owner} /</span>
                  <span className="text-sm font-bold text-white">{activeRepo.name}</span>
                </div>
                {activeRepo.forkedFrom && (
                  <div className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                    Forked from {activeRepo.forkedFrom}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#010409] border border-[#30363d] rounded-md text-xs font-bold hover:bg-[#161b22] transition-colors text-white">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button 
                  onClick={handleFork}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 border border-blue-500 rounded-md text-xs font-bold hover:bg-blue-500 transition-all text-white shadow-lg shadow-blue-900/40"
                >
                  <GitFork className="w-3.5 h-3.5" /> Fork Design
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Viewport Area */}
              <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="flex-1 min-h-0 bg-[#010409] rounded-xl border border-[#30363d] relative overflow-hidden shadow-inner">
                  <ThreeDViewer 
                    parameters={activeRepo.parameters} 
                    geometryType={activeRepo.geometryType} 
                    contextGeometry={activeFeedback?.contextGeometry}
                    material={currentMaterial}
                    wireframe={wireframe}
                  />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button 
                      onClick={() => setWireframe(!wireframe)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-2 border transition-all ${wireframe ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#161b22]/80 text-[#8b949e] border-[#30363d]'}`}
                    >
                      <Box className="w-3 h-3" /> Wireframe
                    </button>
                  </div>
                </div>

                {/* Bottom Action Console */}
                <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-4 flex flex-col gap-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                    <div className="flex gap-4">
                      <button onClick={() => setRepoTab('inspect')} className={`flex items-center gap-2 text-[11px] font-black uppercase transition-all ${repoTab === 'inspect' ? 'text-blue-400' : 'text-[#484f58] hover:text-white'}`}>
                        <Wand2 className="w-3.5 h-3.5" /> AI Designer
                      </button>
                      <button onClick={() => setRepoTab('activeAdjust')} className={`flex items-center gap-2 text-[11px] font-black uppercase transition-all ${repoTab === 'activeAdjust' ? 'text-blue-400' : 'text-[#484f58] hover:text-white'}`}>
                        <Crosshair className="w-3.5 h-3.5" /> Assembly Context
                      </button>
                      <button onClick={() => handleRunFeature('physics')} className={`flex items-center gap-2 text-[11px] font-black uppercase transition-all ${repoTab === 'physics' ? 'text-blue-400' : 'text-[#484f58] hover:text-white'}`}>
                        <Beaker className="w-3.5 h-3.5" /> AI Physics
                      </button>
                      <button onClick={() => handleRunFeature('mfg')} className={`flex items-center gap-2 text-[11px] font-black uppercase transition-all ${repoTab === 'mfg' ? 'text-blue-400' : 'text-[#484f58] hover:text-white'}`}>
                        <Truck className="w-3.5 h-3.5" /> DFM Audit
                      </button>
                    </div>
                  </div>

                  <div className="min-h-[100px] flex items-center">
                    {repoTab === 'inspect' && (
                      <div className="w-full flex gap-3">
                        <input 
                          type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiModify()}
                          placeholder="Describe changes (e.g. 'Make base 50mm wide')..."
                          className="flex-1 bg-[#010409] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={handleAiModify} disabled={isAiLoading || !aiPrompt} className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#30363d] text-white px-6 py-2 rounded-lg font-bold">
                          {isAiLoading ? <Loader2 className="animate-spin" /> : 'Run Assistant'}
                        </button>
                      </div>
                    )}
                    {repoTab === 'activeAdjust' && (
                      <div className="w-full flex gap-3">
                        <input 
                          type="text" value={assemblyContext} onChange={(e) => setAssemblyContext(e.target.value)}
                          placeholder="Assembly target (e.g. 'Standard 2020 extrusion rail mounting')..."
                          className="flex-1 bg-[#010409] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                        />
                        <button onClick={async () => {
                           setIsLoadingFeature(true);
                           const res = await analyzeActiveAdjust(assemblyContext, activeRepo.parameters, activeRepo.intent);
                           setActiveFeedback(res);
                           setIsLoadingFeature(false);
                        }} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Adjust</button>
                      </div>
                    )}
                    {isLoadingFeature && <div className="w-full flex justify-center py-4"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>}
                    {!isLoadingFeature && repoTab === 'physics' && physics && (
                      <div className="w-full grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-2">
                        <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                          <span className="text-[9px] text-[#484f58] uppercase font-black">Mass</span>
                          <div className="text-xl font-bold text-white">{physics.estimatedMass.toFixed(3)} kg</div>
                        </div>
                        <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                          <span className="text-[9px] text-[#484f58] uppercase font-black">Cost</span>
                          <div className="text-xl font-bold text-green-500">${physics.cost.toFixed(2)}</div>
                        </div>
                        <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                          <span className="text-[9px] text-[#484f58] uppercase font-black">Rigidity</span>
                          <div className="text-xl font-bold text-blue-500">{physics.structuralIntegrityScore}%</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {pendingChanges && (
                    <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg flex items-center justify-between animate-in zoom-in-95">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500 rounded-lg text-white"><Wand2 className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">AI Modification Ready</h4>
                          <p className="text-[11px] text-[#8b949e] max-w-lg">{pendingChanges.explanation}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setPendingChanges(null)} className="px-4 py-1.5 bg-[#21262d] text-[#f85149] rounded-md text-[11px] font-black uppercase border border-[#30363d]">Reject</button>
                        <button onClick={applyChanges} className="px-4 py-1.5 bg-green-600 text-white rounded-md text-[11px] font-black uppercase shadow-lg shadow-green-900/30">Commit</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Inspector Sidebar */}
              <aside className="w-80 border-l border-[#30363d] flex flex-col bg-[#0d1117] overflow-y-auto">
                <div className="flex border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-10">
                  <button className="flex-1 py-3 text-[10px] font-black text-white border-b-2 border-blue-500 uppercase">Configuration</button>
                  <button className="flex-1 py-3 text-[10px] font-black text-[#484f58] uppercase">Intents</button>
                </div>

                <div className="p-5 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#484f58] uppercase flex items-center gap-2"><Thermometer className="w-3 h-3" /> Material</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {MATERIALS.map(mat => (
                        <button 
                          key={mat.id} 
                          onClick={() => setActiveRepo({...activeRepo!, currentMaterialId: mat.id})}
                          className={`p-2 rounded-lg border transition-all text-left flex flex-col gap-1 ${activeRepo?.currentMaterialId === mat.id ? 'border-blue-500 bg-blue-500/10' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                        >
                          <div className="w-full h-1 rounded-full" style={{backgroundColor: mat.color}} />
                          <span className="text-[9px] font-bold text-white truncate">{mat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#30363d]">
                    <h4 className="text-[10px] font-black text-[#484f58] uppercase flex items-center gap-2"><Ruler className="w-3 h-3" /> Parameters</h4>
                    {activeRepo.parameters.map(param => (
                      <div key={param.id} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-bold text-[#c9d1d9]">{param.name}</label>
                          <span className="text-[10px] text-blue-400 font-bold mono bg-blue-400/10 px-1.5 rounded">{param.value}{param.unit}</span>
                        </div>
                        <input 
                          type="range" min={param.min} max={param.max} step={0.1} value={param.value}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setActiveRepo({...activeRepo!, parameters: activeRepo!.parameters.map(p => p.id === param.id ? {...p, value: val} : p)});
                          }}
                          className="w-full h-1 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#30363d]">
                     <h4 className="text-[10px] font-black text-[#484f58] uppercase flex items-center gap-2"><History className="w-3 h-3" /> Branch History</h4>
                     <div className="space-y-3">
                      {activeRepo.history.map((commit, i) => (
                        <div key={commit.id} className={`p-2 rounded border border-[#30363d] ${i === 0 ? 'bg-[#161b22]' : 'opacity-60'}`}>
                          <div className="text-[10px] font-bold text-white line-clamp-1">{commit.message}</div>
                          <div className="flex justify-between mt-1 text-[8px] text-[#484f58] uppercase font-bold">
                            <span>{commit.author}</span>
                            <span className="mono">{commit.hash}</span>
                          </div>
                        </div>
                      ))}
                     </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={(v) => { setActiveView(v); resetFeatures(); }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
