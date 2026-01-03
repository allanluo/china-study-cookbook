
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Home, 
  Search, 
  Calendar, 
  BookOpen, 
  CookingPot, 
  Plus, 
  CheckCircle2, 
  ShoppingBag,
  Info,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X,
  PlayCircle,
  FlaskConical,
  Zap,
  Leaf,
  Heart,
  Activity,
  Droplets,
  Camera,
  ExternalLink,
  MessageSquare,
  UtensilsCrossed,
  RotateCcw,
  Flame
} from 'lucide-react';
import { GardenCategory, Recipe, ShoppingItem, PantryItem, RecipeCourse } from './types';
import { INITIAL_RECIPES, CATEGORY_ICONS, CATEGORY_COLORS, DISEASE_TRACKS, PRESERVATION_RULES, FEATURED_SWAPS } from './constants';
import { getGreatExchange, getIngredientHealthTip, analyzeMealImage, getHealthSearch } from './services/geminiService';

type ViewState = 'garden' | 'planner' | 'exchange' | 'health' | 'cooking';

// --- Reusable UI Components ---

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 px-2">
    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
    {subtitle && <p className="text-slate-400 text-sm mt-1 font-medium">{subtitle}</p>}
  </div>
);

const GardenTracker: React.FC<{ 
  dailyProgress: Record<GardenCategory, boolean>, 
  onToggle: (cat: GardenCategory) => void,
  onAiScan: (categories: string[]) => void
}> = ({ dailyProgress, onToggle, onAiScan }) => {
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalHarvested = Object.values(dailyProgress).filter(Boolean).length;
  const categories = Object.values(GardenCategory);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const found = await analyzeMealImage(base64);
      onAiScan(found);
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
      {scanning && (
        <div className="absolute inset-0 z-20 bg-emerald-500/10 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-emerald-700 font-black uppercase text-[10px] tracking-widest">Scanning Meal...</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Garden</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-tighter">Harvest 8 variety points</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl active:scale-90 transition-transform"
        >
          <Camera className="w-5 h-5" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`flex flex-col items-center justify-center p-3 rounded-[1.5rem] transition-all duration-300 border-2 ${
              dailyProgress[cat] 
                ? `${CATEGORY_COLORS[cat]} scale-105 border-current ring-4 ring-offset-1 ring-emerald-50` 
                : 'bg-slate-50 text-slate-300 border-transparent'
            }`}
          >
            <div className="scale-90">{CATEGORY_ICONS[cat]}</div>
            <span className="text-[8px] font-black mt-1.5 uppercase tracking-tighter">{cat}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</div>
         <div className="text-xs font-black text-emerald-600">
            {totalHarvested} / 8 Diversity Points
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewState>('garden');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeIngredientInsight, setActiveIngredientInsight] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<RecipeCourse>('All');
  
  const [dailyProgress, setDailyProgress] = useState<Record<GardenCategory, boolean>>({
    [GardenCategory.FRUITS]: false, [GardenCategory.GRAINS]: false, [GardenCategory.LEAVES]: false, 
    [GardenCategory.ROOTS]: false, [GardenCategory.LEGUMES]: false, [GardenCategory.FLOWERS]: false, 
    [GardenCategory.NUTS]: false, [GardenCategory.MUSHROOMS]: false,
  });
  
  const [plannedRecipes, setPlannedRecipes] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Great Exchange state
  const [exchangeInput, setExchangeInput] = useState('');
  const [exchangeResult, setExchangeResult] = useState<any>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Health search state
  const [academyQuery, setAcademyQuery] = useState('');
  const [academyLoading, setAcademyLoading] = useState(false);
  const [academyAnswer, setAcademyAnswer] = useState<{ text: string, sources: any[] } | null>(null);

  const filteredRecipes = useMemo(() => {
    if (selectedCourse === 'All') return INITIAL_RECIPES;
    return INITIAL_RECIPES.filter(r => r.course === selectedCourse);
  }, [selectedCourse]);

  const courses: RecipeCourse[] = ['All', 'Breakfast', 'Appetizers & Salads', 'Soups', 'Sandwiches', 'Entrées', 'Side Dishes', 'Desserts'];

  const toggleGardenItem = (cat: GardenCategory) => {
    setDailyProgress(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAiScan = (found: string[]) => {
    setDailyProgress(prev => {
      const next = { ...prev };
      found.forEach(cat => {
        const match = Object.values(GardenCategory).find(v => v.toLowerCase() === cat.toLowerCase());
        if (match) next[match] = true;
      });
      return next;
    });
  };

  const handleAddRecipeToPlan = (recipe: Recipe) => {
    if (plannedRecipes.includes(recipe.id)) return;
    setPlannedRecipes(prev => [...prev, recipe.id]);
    const newItems: ShoppingItem[] = recipe.ingredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing, category: 'Produce', purchased: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
    setSelectedRecipe(null);
  };

  const handleExchangeSearch = async (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const query = override || exchangeInput;
    if (!query.trim()) return;
    
    setExchangeLoading(true);
    setExchangeResult(null);
    const data = await getGreatExchange(query);
    setExchangeResult(data);
    setExchangeLoading(false);
  };

  const handleAcademySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyQuery.trim()) return;
    setAcademyLoading(true);
    const res = await getHealthSearch(academyQuery);
    setAcademyAnswer(res);
    setAcademyLoading(false);
  };

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'garden': return 'My Garden';
      case 'planner': return 'Meal Planner';
      case 'exchange': return 'Great Exchange';
      case 'health': return 'Health Hub';
      case 'cooking': return 'No-Fat Cooking';
      default: return 'Eden';
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Dynamic Header */}
      <header className="px-8 pt-12 pb-6 bg-white/80 backdrop-blur-xl sticky top-0 z-[60] flex justify-between items-center border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Eden</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
            {getHeaderTitle()}
          </h1>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center shadow-inner border border-emerald-100/50">
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        {/* --- MY GARDEN TAB --- */}
        {activeTab === 'garden' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <GardenTracker dailyProgress={dailyProgress} onToggle={toggleGardenItem} onAiScan={handleAiScan} />
            
            <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200/50">
               <h3 className="text-xl font-black mb-2">Diversity is Key</h3>
               <p className="text-emerald-50 text-xs font-medium leading-relaxed">The China Study shows that eating a wide variety of whole plant parts ensures a complete spectrum of phytonutrients.</p>
            </div>
          </div>
        )}

        {/* --- MEAL PLANNER TAB --- */}
        {activeTab === 'planner' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Weekly Focus Goal */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <SectionHeader title="Weekly Focus" subtitle="Aim for 4 diverse main dishes" />
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min((plannedRecipes.length / 4) * 100, 100)}%` }} />
                  </div>
                  <span className="font-black text-emerald-400 text-sm">{plannedRecipes.length}/4</span>
                </div>
              </div>
              <UtensilsCrossed className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
            </div>

            {/* Shopping List Quick View */}
            {shoppingList.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900">Shopping List</h3>
                  <button onClick={() => setShoppingList([])} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <div className="space-y-2">
                  {shoppingList.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-50">
                      <div className="w-4 h-4 border-2 border-slate-200 rounded-full" />
                      <span className="text-slate-700 font-bold text-xs">{item.name}</span>
                    </div>
                  ))}
                  {shoppingList.length > 3 && (
                    <div className="text-[10px] font-black text-slate-300 uppercase text-center mt-2">
                      + {shoppingList.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recipe Library */}
            <div className="space-y-4">
              <SectionHeader title="WFPB Library" />
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-2 px-2">
                {courses.map(course => (
                  <button key={course} onClick={() => setSelectedCourse(course)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCourse === course ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                    }`}>
                    {course}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredRecipes.map(r => (
                  <div key={r.id} onClick={() => setSelectedRecipe(r)}
                    className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">{r.course}</span>
                        <h3 className="font-bold text-xl text-slate-900 leading-tight">{r.name}</h3>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-300">
                         {CATEGORY_ICONS[r.categories[0]]}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                       <div className="flex -space-x-2">
                          {r.categories.slice(0, 3).map((c, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${CATEGORY_COLORS[c]}`}>
                              <span className="scale-[0.6]">{CATEGORY_ICONS[c]}</span>
                            </div>
                          ))}
                       </div>
                       <div className="flex-1">
                          <div className="text-[9px] font-black text-slate-300 uppercase">Yield Score</div>
                          <div className="text-xs font-black text-slate-600">+{r.categories.length} points</div>
                       </div>
                       {plannedRecipes.includes(r.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- GREAT EXCHANGE TAB --- */}
        {activeTab === 'exchange' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                Substitution Engine
              </h2>
              <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed">Search for any non-WFPB ingredient (oil, sugar, eggs) to find a whole food alternative.</p>
              <form onSubmit={handleExchangeSearch} className="relative">
                <input 
                  type="text" value={exchangeInput} onChange={(e) => setExchangeInput(e.target.value)}
                  placeholder="e.g. Eggs for baking..."
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 pr-14 focus:border-blue-500 transition-all outline-none font-medium text-slate-700"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 bottom-2.5 bg-blue-500 text-white px-3 rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-transform">
                  {exchangeLoading ? <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"/> : <ChevronRight className="w-6 h-6" />}
                </button>
              </form>
              
              {exchangeResult && (
                <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] animate-in slide-in-from-top-2">
                  <div className="text-blue-900 font-black text-xl mb-2">{exchangeResult.substitution}</div>
                  <div className="text-blue-700/60 text-[9px] font-black uppercase tracking-widest mb-3">Science Reason</div>
                  <p className="text-blue-800 font-medium text-sm leading-relaxed mb-4 italic">"{exchangeResult.reason}"</p>
                  <div className="text-blue-700/60 text-[9px] font-black uppercase tracking-widest mb-3">How to Use</div>
                  <p className="text-blue-800/80 text-xs font-bold leading-relaxed">{exchangeResult.howToUse}</p>
                </div>
              )}

              {!exchangeResult && !exchangeLoading && (
                <div className="mt-10">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Common Substitutions</div>
                  <div className="grid grid-cols-2 gap-3">
                    {FEATURED_SWAPS.map(swap => (
                      <button 
                        key={swap.label} 
                        onClick={() => {
                          setExchangeInput(swap.label);
                          handleExchangeSearch(undefined, swap.label);
                        }}
                        className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-left hover:bg-white hover:shadow-md transition-all active:scale-95 group"
                      >
                        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{swap.icon}</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase leading-tight">{swap.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- HEALTH HUB TAB --- */}
        {activeTab === 'health' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <SectionHeader title="Ask Dr. AI" subtitle="Evidence-based nutrition science" />
              <form onSubmit={handleAcademySearch} className="relative mb-4">
                <input 
                  type="text" value={academyQuery} onChange={(e) => setAcademyQuery(e.target.value)}
                  placeholder="e.g. Heart health & legumes?"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 pr-14 focus:border-purple-500 transition-all outline-none font-medium text-slate-700"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 bottom-2.5 bg-purple-500 text-white px-3 rounded-xl active:scale-90 transition-transform">
                  {academyLoading ? <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"/> : <Search className="w-5 h-5" />}
                </button>
              </form>
              {academyAnswer && (
                <div className="space-y-4 animate-in zoom-in-95">
                  <div className="text-sm text-slate-700 leading-relaxed font-medium bg-purple-50/40 p-6 rounded-3xl border border-purple-100 markdown-content">
                    <ReactMarkdown>{academyAnswer.text}</ReactMarkdown>
                  </div>
                  {academyAnswer.sources.length > 0 && (
                    <div className="px-2">
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Clinical Sources</div>
                      <div className="flex flex-col gap-2">
                        {academyAnswer.sources.map((source, idx) => (
                          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-[10px] font-bold text-slate-600 truncate mr-4">{source.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-2 space-y-4">
               <h3 className="font-black text-slate-900">Chronic Disease Prevention</h3>
               <div className="grid grid-cols-1 gap-4">
                  {DISEASE_TRACKS.map(track => (
                    <div key={track.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                       <h4 className="font-black text-slate-800 text-sm mb-1">{track.title}</h4>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{track.description}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* --- NO-FAT COOKING TAB --- */}
        {activeTab === 'cooking' && (
          <div className="space-y-8 animate-in fade-in pb-24">
            <div className="space-y-4">
              <SectionHeader title="Mastering WFPB" subtitle="Oil-free culinary techniques" />
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative shadow-2xl overflow-hidden">
                <h2 className="text-2xl font-black mb-2">Water Sautéing</h2>
                <p className="text-indigo-100 text-xs mb-6 leading-relaxed">The cornerstone of WFPB cooking. Caramelize onions and vegetables using only a splash of water, broth, or wine.</p>
                <button className="bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 active:scale-95 shadow-xl">
                  <PlayCircle className="w-5 h-5" /> Technique Guide
                </button>
                <Droplets className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
              </div>

              <div className="px-2 mt-8">
                <h3 className="font-black text-slate-900 mb-4">Ingredient Preservation</h3>
                <div className="grid grid-cols-1 gap-4">
                  {PRESERVATION_RULES.map(rule => (
                    <div key={rule.item} className="bg-white p-6 rounded-3xl border border-slate-100 flex gap-4 shadow-sm items-center">
                      <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 h-fit"><Zap className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{rule.item}: {rule.rule}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{rule.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-between px-6 pt-4 pb-10 z-50">
        {[
          { id: 'garden', icon: Leaf, label: 'Garden' },
          { id: 'planner', icon: Calendar, label: 'Plan' },
          { id: 'exchange', icon: RotateCcw, label: 'Swap' },
          { id: 'health', icon: Heart, label: 'Health' },
          { id: 'cooking', icon: Flame, label: 'Skills' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as ViewState)}
            className={`flex flex-col items-center gap-1.5 transition-all min-w-[64px] ${
              activeTab === item.id ? 'text-emerald-600 scale-105' : 'text-slate-300'
            }`}>
            <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[8px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* --- RECIPE MODAL --- */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-8 flex flex-col">
          <div className="relative h-64 bg-slate-900 flex items-center justify-center overflow-hidden">
            <button onClick={() => setSelectedRecipe(null)} className="absolute top-12 left-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white z-20">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="scale-[5] opacity-20 text-white z-10">{CATEGORY_ICONS[selectedRecipe.categories[0]]}</div>
            <div className="absolute -bottom-8 left-8 right-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 z-30">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{selectedRecipe.name}</h2>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase shrink-0">WFPB</div>
              </div>
              <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">{selectedRecipe.description}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto mt-16 px-8 pb-32 space-y-8">
            <div className="flex flex-wrap gap-2 pt-4">
              {selectedRecipe.categories.map(c => (
                <span key={c} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 ${CATEGORY_COLORS[c]}`}>
                  {c}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black flex items-center gap-2">Ingredients</h3>
              <div className="grid grid-cols-1 gap-2">
                {selectedRecipe.ingredients.map(ing => (
                  <button key={ing} onClick={async () => {
                      const tip = await getIngredientHealthTip(ing);
                      setActiveIngredientInsight(tip);
                    }}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-left border border-slate-100 active:bg-blue-50 transition-colors">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="font-bold text-slate-700 text-sm flex-1">{ing}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Health Tip</span>
                      <Info className="w-4 h-4 text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-black">Preparation</h3>
              <div className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100">
                <ol className="space-y-4 list-decimal pl-5">
                  {selectedRecipe.instructions.split('. ').map((step, idx) => (
                    step.trim() && (
                      <li key={idx} className="text-slate-600 text-sm leading-relaxed font-medium">
                        {step.endsWith('.') ? step : `${step}.`}
                      </li>
                    )
                  ))}
                </ol>
              </div>
            </div>

            {selectedRecipe.healthTip && (
              <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 shadow-sm mb-10">
                <div className="flex items-center gap-2 mb-2 text-purple-600">
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Medical Insight</span>
                </div>
                <p className="text-sm text-purple-900 font-bold italic leading-relaxed">"{selectedRecipe.healthTip}"</p>
              </div>
            )}
          </div>

          <div className="p-8 border-t bg-white/80 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[110]">
            <button 
              onClick={() => handleAddRecipeToPlan(selectedRecipe)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-transform"
            >
              {plannedRecipes.includes(selectedRecipe.id) ? 'Planned for Week' : 'Harvest This Recipe'}
            </button>
          </div>
        </div>
      )}

      {/* Health Tip Insight Overlay */}
      {activeIngredientInsight && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl">
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Scientific Context</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8 italic">"{activeIngredientInsight}"</p>
            <button onClick={() => setActiveIngredientInsight(null)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
