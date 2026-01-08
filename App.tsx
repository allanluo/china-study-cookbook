
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  CheckCircle2, 
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
  Droplets,
  Camera,
  ExternalLink,
  UtensilsCrossed,
  RotateCcw,
  Flame,
  Search,
  Activity
} from 'lucide-react';
import { GardenCategory, Recipe, ShoppingItem, RecipeCourse, DiseaseTrack } from './types';
import { INITIAL_RECIPES, CATEGORY_ICONS, CATEGORY_COLORS, DISEASE_TRACKS, PRESERVATION_RULES, FEATURED_SWAPS } from './constants';
import { getGreatExchange, getIngredientHealthTip, analyzeMealImage, getHealthSearch, generateRecipeImage } from './services/geminiService';

type ViewState = 'garden' | 'planner' | 'exchange' | 'health' | 'cooking';

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
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
      {scanning && (
        <div className="absolute inset-0 z-20 bg-emerald-500/10 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-emerald-700 font-black uppercase text-[10px] tracking-widest">Scanning Meal...</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Harvest</h2>
          <p className="text-emerald-600 text-[10px] mt-0.5 font-bold uppercase tracking-widest">Digital Blueprint Tracker</p>
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
         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Garden Score</div>
         <div className="text-xs font-black text-emerald-600">
            {totalHarvested} / 8 Points
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewState>('planner');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeIngredientInsight, setActiveIngredientInsight] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<RecipeCourse>('All');
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  
  const [dailyProgress, setDailyProgress] = useState<Record<GardenCategory, boolean>>(() => {
    const saved = localStorage.getItem('eden_daily_progress');
    return saved ? JSON.parse(saved) : {
      [GardenCategory.FRUITS]: false, [GardenCategory.GRAINS]: false, [GardenCategory.LEAVES]: false, 
      [GardenCategory.ROOTS]: false, [GardenCategory.LEGUMES]: false, [GardenCategory.FLOWERS]: false, 
      [GardenCategory.NUTS]: false, [GardenCategory.MUSHROOMS]: false,
    };
  });
  
  const [plannedRecipes, setPlannedRecipes] = useState<string[]>(() => {
    const saved = localStorage.getItem('eden_planned_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('eden_shopping_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('eden_daily_progress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  useEffect(() => {
    localStorage.setItem('eden_planned_recipes', JSON.stringify(plannedRecipes));
  }, [plannedRecipes]);

  useEffect(() => {
    localStorage.setItem('eden_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const [exchangeInput, setExchangeInput] = useState('');
  const [exchangeResult, setExchangeResult] = useState<any>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const [academyQuery, setAcademyQuery] = useState('');
  const [academyLoading, setAcademyLoading] = useState(false);
  const [academyAnswer, setAcademyAnswer] = useState<{ text: string, sources: any[] } | null>(null);

  const filteredRecipes = useMemo(() => {
    let recipes = INITIAL_RECIPES;
    if (selectedCourse !== 'All') {
      recipes = recipes.filter(r => r.course === selectedCourse);
    }
    return recipes;
  }, [selectedCourse]);

  const trackRecipes = useMemo(() => {
    if (!activeTrackId) return [];
    return INITIAL_RECIPES.filter(r => r.tracks?.includes(activeTrackId));
  }, [activeTrackId]);

  const harvestedRecipes = useMemo(() => {
    return INITIAL_RECIPES.filter(r => plannedRecipes.includes(r.id));
  }, [plannedRecipes]);

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
      name: ing, 
      category: 'Produce', 
      purchased: false,
      recipeId: recipe.id
    }));
    setShoppingList(prev => [...prev, ...newItems]);
    setSelectedRecipe(null);
  };

  const handleRemoveFromPlan = (recipeId: string) => {
    setPlannedRecipes(prev => prev.filter(id => id !== recipeId));
    setShoppingList(prev => prev.filter(item => item.recipeId !== recipeId));
  };

  const handleResetPlan = () => {
    if (window.confirm('Clear all planned recipes?')) {
      setPlannedRecipes([]);
      setShoppingList([]);
    }
  };

  const handleGenerateRecipeImage = async (recipe: Recipe) => {
    setGeneratingImageId(recipe.id);
    const imageUrl = await generateRecipeImage(recipe.name, recipe.description);
    if (imageUrl) {
      setGeneratedImages(prev => ({ ...prev, [recipe.id]: imageUrl }));
    }
    setGeneratingImageId(null);
  };

  const handleExchangeSearch = async (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const query = override || exchangeInput;
    if (!query.trim()) return;
    setExchangeLoading(true);
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

  // Fixed: Defined RecipeCard as a React.FC to properly handle React's internal 'key' prop when rendering in lists
  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <div 
      onClick={() => setSelectedRecipe(recipe)} 
      className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">{recipe.course}</span>
          <h3 className="font-bold text-xl text-slate-900 leading-tight">{recipe.name}</h3>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-300">
           {CATEGORY_ICONS[recipe.categories[0]]}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
         <div className="flex -space-x-2">
            {recipe.categories.slice(0, 3).map((c, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${CATEGORY_COLORS[c]}`}>
                <span className="scale-[0.6]">{CATEGORY_ICONS[c]}</span>
              </div>
            ))}
         </div>
         <div className="flex-1">
            <div className="text-[9px] font-black text-slate-300 uppercase">Yield Score</div>
            <div className="text-xs font-black text-slate-600">+{recipe.categories.length} points</div>
         </div>
         {plannedRecipes.includes(recipe.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <header className="px-8 py-10 bg-white flex justify-between items-center border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Eden</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
            {activeTab === 'planner' ? 'Meal Planner' : activeTab === 'garden' ? 'My Garden' : activeTab === 'exchange' ? 'Swap Engine' : 'Health Hub'}
          </h1>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center border border-emerald-100/50">
          {activeTab === 'planner' ? <UtensilsCrossed className="w-6 h-6 text-emerald-600" /> : <Leaf className="w-6 h-6 text-emerald-600" />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        {activeTab === 'garden' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <GardenTracker dailyProgress={dailyProgress} onToggle={toggleGardenItem} onAiScan={handleAiScan} />
            
            <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200/50">
               <h3 className="text-xl font-black mb-2">The Garden Rule</h3>
               <p className="text-white/80 text-xs font-medium leading-relaxed">Aim for a spectrum of whole plant parts every day. This daily harvest ensures your body receives the full synergy of phytonutrients and minerals found across all eight botanical categories.</p>
            </div>

            <button 
              onClick={() => {
                if (window.confirm("Reset daily harvest?")) {
                  setDailyProgress({
                    [GardenCategory.FRUITS]: false, [GardenCategory.GRAINS]: false, [GardenCategory.LEAVES]: false, 
                    [GardenCategory.ROOTS]: false, [GardenCategory.LEGUMES]: false, [GardenCategory.FLOWERS]: false, 
                    [GardenCategory.NUTS]: false, [GardenCategory.MUSHROOMS]: false,
                  });
                }
              }}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-red-400"
            >
              Reset Daily Harvest
            </button>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <SectionHeader title="Weekly Harvest" subtitle="Your planned blueprints" />
                  {plannedRecipes.length > 0 && (
                    <button onClick={handleResetPlan} className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-2 mb-8">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min((plannedRecipes.length / 4) * 100, 100)}%` }} />
                  </div>
                  <span className="font-black text-emerald-400 text-sm">{plannedRecipes.length}/4</span>
                </div>

                <div className="space-y-3">
                  {harvestedRecipes.map(recipe => (
                    <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="group flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 cursor-pointer active:scale-[0.98] transition-all">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center scale-90 ${CATEGORY_COLORS[recipe.categories[0]]}`}>
                        <span className="scale-[0.6]">{CATEGORY_ICONS[recipe.categories[0]]}</span>
                      </div>
                      <span className="flex-1 text-xs font-bold text-white truncate">{recipe.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveFromPlan(recipe.id); }} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded-lg">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <UtensilsCrossed className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 pointer-events-none" />
            </div>

            <div className="space-y-4">
              <SectionHeader title="Library" subtitle="WFPB Blueprints" />
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {courses.map(course => (
                  <button key={course} onClick={() => setSelectedCourse(course)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCourse === course ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'
                    }`}>
                    {course}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                Substitution Engine
              </h2>
              <form onSubmit={handleExchangeSearch} className="relative">
                <input 
                  type="text" value={exchangeInput} onChange={(e) => setExchangeInput(e.target.value)}
                  placeholder="Search for a swap..."
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-blue-500 outline-none font-medium"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 bottom-2.5 bg-blue-600 text-white px-3 rounded-xl active:scale-90 transition-transform">
                  {exchangeLoading ? <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"/> : <ChevronRight className="w-6 h-6" />}
                </button>
              </form>
              
              {exchangeResult && (
                <div className="mt-4 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] animate-in slide-in-from-top-2">
                  <div className="text-blue-900 font-black text-xl mb-2">{exchangeResult.substitution}</div>
                  <p className="text-blue-800 font-medium text-sm leading-relaxed mb-4 italic">"{exchangeResult.reason}"</p>
                  <p className="text-blue-800/80 text-xs font-bold leading-relaxed">{exchangeResult.howToUse}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <SectionHeader title="Featured Swaps" subtitle="Common WFPB replacements" />
              <div className="grid grid-cols-2 gap-3">
                {FEATURED_SWAPS.map(swap => (
                  <button key={swap.label} onClick={() => { setExchangeInput(swap.label); handleExchangeSearch(undefined, swap.label); }}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                    <span className="text-xl">{swap.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{swap.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-8 animate-in fade-in">
            {activeTrackId ? (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <button 
                  onClick={() => setActiveTrackId(null)}
                  className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Health Hub
                </button>
                
                {DISEASE_TRACKS.find(t => t.id === activeTrackId) && (
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{DISEASE_TRACKS.find(t => t.id === activeTrackId)?.title}</h2>
                    <p className="text-slate-500 text-sm font-medium mb-4">{DISEASE_TRACKS.find(t => t.id === activeTrackId)?.description}</p>
                    <div className="bg-emerald-50 p-4 rounded-xl text-[11px] font-bold text-emerald-700 leading-relaxed border-l-4 border-emerald-500">
                      {DISEASE_TRACKS.find(t => t.id === activeTrackId)?.impact}
                    </div>
                  </div>
                )}

                <SectionHeader title="Targeted Blueprints" subtitle={`Recipes optimized for ${DISEASE_TRACKS.find(t => t.id === activeTrackId)?.title}`} />
                <div className="grid grid-cols-1 gap-6">
                  {trackRecipes.length > 0 ? (
                    trackRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)
                  ) : (
                    <div className="text-center py-12 bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold text-sm">More targeted recipes coming soon.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                  <SectionHeader title="Health Hub" subtitle="Research & Evidence" />
                  <form onSubmit={handleAcademySearch} className="relative mb-4">
                    <input 
                      type="text" value={academyQuery} onChange={(e) => setAcademyQuery(e.target.value)}
                      placeholder="Ask a health question..."
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-purple-500 outline-none font-medium"
                    />
                    <button type="submit" className="absolute right-2.5 top-2.5 bottom-2.5 bg-purple-600 text-white px-3 rounded-xl transition-transform">
                      {academyLoading ? <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"/> : <Search className="w-5 h-5" />}
                    </button>
                  </form>
                  {academyAnswer && (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <div className="text-sm text-slate-700 leading-relaxed font-medium bg-purple-50/40 p-6 rounded-3xl border border-purple-100 markdown-content">
                        <ReactMarkdown>{academyAnswer.text}</ReactMarkdown>
                      </div>
                      {academyAnswer.sources.length > 0 && (
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Evidence Sources</p>
                           <div className="flex flex-wrap gap-2">
                              {academyAnswer.sources.map((s, idx) => (
                                <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-purple-400 transition-colors">
                                   <ExternalLink className="w-3 h-3" /> {s.title}
                                </a>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <SectionHeader title="Disease Reversal" subtitle="Condition-specific tracks" />
                  <div className="space-y-4">
                    {DISEASE_TRACKS.map(track => (
                      <div 
                        key={track.id} 
                        onClick={() => setActiveTrackId(track.id)}
                        className="group bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 cursor-pointer active:scale-[0.98] transition-all hover:border-emerald-200"
                      >
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Activity className="w-5 h-5 text-emerald-500" />
                              <h4 className="font-black text-lg text-slate-900">{track.title}</h4>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                         </div>
                         <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">{track.description}</p>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">View Blueprints</span>
                            <Heart className="w-4 h-4 text-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'cooking' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <SectionHeader title="Preservation" subtitle="Maintaining nutrient density" />
              <div className="space-y-4">
                {PRESERVATION_RULES.map(rule => (
                  <div key={rule.item} className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Droplets className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none mb-1">{rule.item}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-0.5">{rule.rule}</p>
                      <p className="text-[10px] font-medium text-slate-400 italic">{rule.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
               <h3 className="text-xl font-black mb-2 relative z-10">Water Sautéing</h3>
               <p className="text-white/60 text-xs font-medium leading-relaxed relative z-10 mb-6">Learn to cook without oil. Use small amounts of water or broth to prevent sticking while caramelizing natural sugars.</p>
               <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all group relative z-10">
                  <PlayCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Watch Skill Lab</span>
               </button>
               <Flame className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-between px-6 pt-4 pb-10 z-50">
        {[
          { id: 'planner', icon: UtensilsCrossed, label: 'Plan' },
          { id: 'garden', icon: Leaf, label: 'Garden' },
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

      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-8 flex flex-col">
          <div className="px-8 pt-12 pb-4 flex items-center">
            <button onClick={() => setSelectedRecipe(null)} className="p-2 -ml-2 text-slate-900 active:scale-90 transition-transform">
              <ArrowLeft className="w-7 h-7" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedRecipe.course}</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedRecipe.name}</h2>
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{selectedRecipe.description}</p>
            </div>

            <div className="space-y-6 pt-2">
              {generatedImages[selectedRecipe.id] ? (
                <img src={generatedImages[selectedRecipe.id]} alt={selectedRecipe.name} className="w-full aspect-square object-cover rounded-[2.5rem] shadow-xl animate-in fade-in" />
              ) : (
                <button onClick={() => handleGenerateRecipeImage(selectedRecipe)} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all hover:bg-emerald-50 group">
                  {generatingImageId === selectedRecipe.id ? (
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visualize with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black flex items-center gap-2 text-slate-900">Ingredients</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {selectedRecipe.ingredients.map(ing => (
                  <button key={ing} onClick={async () => {
                      const tip = await getIngredientHealthTip(ing);
                      setActiveIngredientInsight(tip);
                    }}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl text-left border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="font-bold text-slate-700 text-sm flex-1">{ing}</span>
                    <Info className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">Preparation</h3>
              <div className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100/50">
                <ol className="space-y-5 list-decimal pl-5">
                  {selectedRecipe.instructions.split('. ').map((step, idx) => (
                    step.trim() && (
                      <li key={idx} className="text-slate-600 text-sm leading-relaxed font-semibold">
                        {step.endsWith('.') ? step : `${step}.`}
                      </li>
                    )
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="p-8 border-t bg-white/80 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[110]">
            <button 
              onClick={() => handleAddRecipeToPlan(selectedRecipe)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform"
            >
              {plannedRecipes.includes(selectedRecipe.id) ? 'Planned for Week' : 'Harvest This Recipe'}
            </button>
          </div>
        </div>
      )}

      {activeIngredientInsight && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Ingredient Insight</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8 italic">"{activeIngredientInsight}"</p>
            <button onClick={() => setActiveIngredientInsight(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">Understood</button>
          </div>
        </div>
      )}
    </div>
  );
}
