
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MOCK_REPOS } from './mockData';
import { CADRepository, Parameter, AIModificationResult, ActiveAdjustFeedback } from './types';
import { ThreeDViewer } from './components/ThreeDViewer';
import { modifyParametricModel, analyzeActiveAdjust } from './services/geminiService';
import { 
  Star, 
  GitFork, 
  Eye, 
  ChevronRight, 
  ShieldAlert, 
  Wand2, 
  Activity, 
  History,
  Info,
  Layers,
  Check,
  X,
  Loader2,
  Database,
  Crosshair,
  Zap,
  Hammer,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'discover' | 'repo'>('discover');
  const [repoTab, setRepoTab] = useState<'inspect' | 'activeAdjust'>('inspect');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<AIModificationResult | null>(null);
  const [activeRepo, setActiveRepo] = useState<CADRepository | null>(null);

  // Active Adjust State
  const [assemblyContext, setAssemblyContext] = useState('');
  const [activeFeedback, setActiveFeedback] = useState<ActiveAdjustFeedback | null>(null);
  const [isAdjustLoading, setIsAdjustLoading] = useState(false);

  const handleSelectRepo = (repoId: string) => {
    const repo = MOCK_REPOS.find(r => r.id === repoId);
    if (repo) {
      setActiveRepo(JSON.parse(JSON.stringify(repo)));
      setActiveView('repo');
      setRepoTab('inspect');
      setActiveFeedback(null);
    }
  };

  const handleAiModify = async () => {
    if (!aiPrompt || !activeRepo) return;
    setIsAiLoading(true);
    try {
      const result = await modifyParametricModel(aiPrompt, activeRepo.parameters, activeRepo.intent);
      setPendingChanges(result);
    } catch (error) {
      alert("AI modification failed. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleActiveAdjust = async () => {
    if (!assemblyContext || !activeRepo) return;
    setIsAdjustLoading(true);
    try {
      const feedback = await analyzeActiveAdjust(assemblyContext, activeRepo.parameters, activeRepo.intent);
      setActiveFeedback(feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdjustLoading(false);
    }
  };

  const applyChanges = () => {
    if (!pendingChanges || !activeRepo) return;
    const newRepo = { ...activeRepo };
    newRepo.parameters = pendingChanges.updatedParameters;
    newRepo.history = [
      {
        id: `c-${Date.now()}`,
        author: 'Jane Doe',
        timestamp: new Date().toISOString(),
        message: `AI Modification: ${aiPrompt.slice(0, 50)}...`,
        hash: Math.random().toString(36).substring(7),
        parametersSnapshot: [...activeRepo.parameters]
      },
      ...activeRepo.history
    ];
    setActiveRepo(newRepo);
    setPendingChanges(null);
    setAiPrompt('');
  };

  const applySuggestedTweak = () => {
    if (!activeFeedback || !activeRepo) return;
    setAiPrompt(activeFeedback.suggestedAssemblyTweak);
    setRepoTab('inspect');
    // We don't auto-run to allow user review, but let's give a nudge
  };

  const ScoreGauge = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: any, color: string }) => (
    <div className="flex-1 bg-[#0d1117] p-3 rounded-lg border border-[#30363d] relative overflow-hidden group">
      <div className={`absolute top-0 left-0 h-1 bg-${color}-500 transition-all duration-1000`} style={{ width: `${value}%` }} />
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
        <span className="text-xs font-bold text-white mono">{value}%</span>
      </div>
      <div className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">{label}</div>
    </div>
  );

  return (
    <Layout activeView={activeView} onNavigate={(v) => { setActiveView(v); setPendingChanges(null); }}>
      {activeView === 'discover' ? (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Explore Designs</h1>
            <p className="text-[#8b949e]">Safe, reusable, and collaborative mechanical design repositories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_REPOS.map(repo => (
              <div 
                key={repo.id}
                onClick={() => handleSelectRepo(repo.id)}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-blue-500 group-hover:underline">{repo.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forksCount}</span>
                  </div>
                </div>
                <p className="text-sm text-[#8b949e] line-clamp-2 mb-4 h-10">
                  {repo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {repo.author[0]}
                    </div>
                    <span className="text-xs text-[#8b949e] font-medium">{repo.author}</span>
                  </div>
                  <span className="text-[10px] text-[#484f58] uppercase font-bold">Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeRepo ? (
        <div className="flex flex-col h-full bg-[#0d1117]">
          {/* Sub Header */}
          <div className="px-6 py-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-blue-500">
                <Database className="w-5 h-5" />
                <span className="font-semibold text-lg hover:underline cursor-pointer">{activeRepo.author} / {activeRepo.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[10px] font-bold text-[#8b949e] uppercase">Public</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#010409] border border-[#30363d] rounded-md text-sm font-medium hover:bg-[#161b22] transition-colors text-white">
                <Eye className="w-4 h-4" /> Watch
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 border border-blue-500 rounded-md text-sm font-bold hover:bg-blue-500 transition-colors text-white shadow-lg shadow-blue-900/40">
                <GitFork className="w-4 h-4" /> Fork Repository
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col p-4 space-y-4">
              <div className="flex-1 min-h-0 bg-[#010409] rounded-xl border border-[#30363d] relative overflow-hidden">
                <ThreeDViewer 
                  parameters={activeRepo.parameters} 
                  geometryType={activeRepo.geometryType} 
                  contextGeometry={activeFeedback?.contextGeometry}
                />
              </div>

              {/* Interaction Panel */}
              <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-4 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setRepoTab('inspect')}
                      className={`flex items-center gap-2 font-bold text-sm transition-colors ${repoTab === 'inspect' ? 'text-white' : 'text-[#484f58] hover:text-[#8b949e]'}`}
                    >
                      <Wand2 className={`w-4 h-4 ${repoTab === 'inspect' ? 'text-purple-400' : ''}`} />
                      AI Modification
                      {repoTab === 'inspect' && <div className="h-0.5 bg-purple-500 w-full mt-1 absolute bottom-[-16px]" />}
                    </button>
                    <button 
                      onClick={() => setRepoTab('activeAdjust')}
                      className={`flex items-center gap-2 font-bold text-sm transition-colors relative ${repoTab === 'activeAdjust' ? 'text-white' : 'text-[#484f58] hover:text-[#8b949e]'}`}
                    >
                      <Crosshair className={`w-4 h-4 ${repoTab === 'activeAdjust' ? 'text-blue-400' : ''}`} />
                      Active Adjust
                      <span className="absolute -top-1 -right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    </button>
                  </div>
                </div>

                {repoTab === 'inspect' ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiModify()}
                          placeholder="Describe your design changes..." 
                          className="w-full bg-[#010409] border border-[#30363d] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-[#484f58]"
                        />
                      </div>
                      <button 
                        onClick={handleAiModify}
                        disabled={isAiLoading || !aiPrompt}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-[#30363d] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30 min-w-[120px] justify-center"
                      >
                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={assemblyContext}
                          onChange={(e) => setAssemblyContext(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleActiveAdjust()}
                          placeholder="Assembly target (e.g. 'Standard 2020 extrusion rail mounting')..." 
                          className="w-full bg-[#010409] border border-[#30363d] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-[#484f58]"
                        />
                      </div>
                      <button 
                        onClick={handleActiveAdjust}
                        disabled={isAdjustLoading || !assemblyContext}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#30363d] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 min-w-[120px] justify-center"
                      >
                        {isAdjustLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Fit to Assembly</>}
                      </button>
                    </div>

                    {activeFeedback && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="md:col-span-1 flex flex-col gap-2">
                          <ScoreGauge label="Stability" value={activeFeedback.stability} icon={Zap} color="yellow" />
                          <ScoreGauge label="Feasibility" value={activeFeedback.feasibility} icon={Hammer} color="green" />
                          <ScoreGauge label="Assembly Fit" value={activeFeedback.fitScore} icon={Crosshair} color="blue" />
                        </div>
                        <div className="md:col-span-3 bg-[#0d1117] border border-[#30363d] rounded-lg p-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest flex items-center gap-2">
                              <ShieldAlert className="w-3 h-3 text-blue-400" /> Engineering Feedback
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {activeFeedback.engineeringInsights.map((insight, i) => (
                                <div key={i} className="flex gap-2 text-xs text-[#8b949e]">
                                  <span className="text-blue-500 font-bold">•</span>
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-[#161b22] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-blue-300">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="font-medium truncate max-w-[300px] italic">Suggest: {activeFeedback.suggestedAssemblyTweak}</span>
                            </div>
                            <button 
                              onClick={applySuggestedTweak}
                              className="px-4 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-xs font-bold hover:bg-blue-500/30 transition-all whitespace-nowrap"
                            >
                              Adopt AI Suggestion
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {pendingChanges && (
                  <div className="mt-2 p-4 bg-[#0d1117] border border-purple-500/30 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" /> AI Proposal Review
                      </h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPendingChanges(null)}
                          className="px-3 py-1 bg-[#21262d] text-[#f85149] rounded border border-[#30363d] text-xs font-bold flex items-center gap-1 hover:bg-[#30363d]"
                        >
                          <X className="w-3 h-3" /> Dismiss
                        </button>
                        <button 
                          onClick={applyChanges}
                          className="px-3 py-1 bg-[#238636] text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-[#2ea043]"
                        >
                          <Check className="w-3 h-3" /> Apply Changes
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-[#8b949e] leading-relaxed italic bg-[#161b22] p-3 rounded border-l-2 border-purple-500">
                      &quot;{pendingChanges.explanation}&quot;
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">Parameter Diff</span>
                        <div className="space-y-1">
                          {pendingChanges.updatedParameters.map(p => {
                            const old = activeRepo.parameters.find(op => op.id === p.id);
                            const changed = old && old.value !== p.value;
                            return (
                              <div key={p.id} className={`flex justify-between text-xs p-2 rounded ${changed ? 'bg-green-500/10 border border-green-500/20' : 'bg-transparent text-[#484f58]'}`}>
                                <span className="font-medium">{p.name}</span>
                                <div className="flex gap-2 items-center">
                                  {changed && <span className="line-through opacity-50">{old.value}</span>}
                                  <span className={changed ? 'text-green-400 font-bold' : ''}>{p.value} {p.unit}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                       </div>
                       <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">Intent Validation</span>
                        <div className="space-y-1">
                          {pendingChanges.intentViolations.length > 0 ? (
                            pendingChanges.intentViolations.map((v, i) => (
                              <div key={i} className="flex gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs items-start">
                                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>{v}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs items-center">
                              <Check className="w-3.5 h-3.5 shrink-0" />
                              <span>No design intent violations detected.</span>
                            </div>
                          )}
                        </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Inspector */}
            <aside className="w-80 border-l border-[#30363d] flex flex-col bg-[#0d1117] overflow-y-auto">
              <div className="flex flex-col">
                <div className="flex border-b border-[#30363d] sticky top-0 bg-[#0d1117] z-10">
                  <button className="flex-1 py-3 text-xs font-bold text-white border-b-2 border-blue-500 uppercase tracking-wider">Params</button>
                  <button className="flex-1 py-3 text-xs font-bold text-[#8b949e] uppercase tracking-wider hover:text-white transition-colors">Intent</button>
                  <button className="flex-1 py-3 text-xs font-bold text-[#8b949e] uppercase tracking-wider hover:text-white transition-colors">History</button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    {activeRepo.parameters.map((param) => (
                      <div key={param.id} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-[#c9d1d9] flex items-center gap-1.5">
                            {param.name}
                            <Info className="w-3 h-3 text-[#484f58] opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                          </label>
                          <span className="text-xs text-[#8b949e] mono">{param.value} {param.unit}</span>
                        </div>
                        <input 
                          type="range" 
                          min={param.min || 0} 
                          max={param.max || 100} 
                          step={param.unit === 'mm' ? 0.5 : 1}
                          value={param.value}
                          onChange={(e) => {
                            const newParams = activeRepo.parameters.map(p => 
                              p.id === param.id ? { ...p, value: parseFloat(e.target.value) } : p
                            );
                            setActiveRepo({ ...activeRepo, parameters: newParams });
                          }}
                          className="w-full h-1.5 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-[#30363d] space-y-4">
                    <h4 className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Design Intent Layer
                    </h4>
                    {activeRepo.intent.map((intent) => (
                      <div key={intent.id} className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black ${
                            intent.priority === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                            intent.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                            'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                          }`}>
                            {intent.priority}
                          </span>
                          <span className="text-[9px] text-[#484f58] uppercase font-bold">{intent.constraintType}</span>
                        </div>
                        <p className="text-xs text-[#8b949e] italic leading-relaxed">
                          &quot;{intent.description}&quot;
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-[#30363d] space-y-4">
                    <h4 className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest flex items-center gap-2">
                      <History className="w-3 h-3" /> Commit History
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#30363d]">
                      {activeRepo.history.map((commit) => (
                        <div key={commit.id} className="relative pl-6">
                          <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#0d1117] bg-[#30363d]"></div>
                          <div className="text-[11px] font-bold text-white mb-0.5">{commit.message}</div>
                          <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
                            <span>{commit.author}</span>
                            <span className="mono">{commit.hash}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default App;
