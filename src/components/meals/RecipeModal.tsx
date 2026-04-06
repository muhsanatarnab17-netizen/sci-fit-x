import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Clock, Leaf } from "lucide-react";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: {
    name: string;
    image: string;
    instructions: string[];
    ingredients: string[];
    prepTime: string;
  };
}

export default function RecipeModal({ isOpen, onClose, meal }: RecipeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header Image */}
            <div className="h-48 w-full relative">
              <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">{meal.name}</h2>
              
              <div className="flex gap-4 mb-8">
                <div className="flex items-center text-xs font-bold text-primary uppercase"><Clock className="w-4 h-4 mr-2" /> {meal.prepTime}</div>
                <div className="flex items-center text-xs font-bold text-orange-400 uppercase"><Flame className="w-4 h-4 mr-2" /> High Protein</div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-3 flex items-center">
                    <Leaf className="w-4 h-4 mr-2" /> Ingredients
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {meal.ingredients.map((ing, i) => (
                      <li key={i} className="text-white/80 text-sm bg-white/5 p-3 rounded-xl border border-white/5">{ing}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-3">Cooking Steps</h3>
                  <div className="space-y-4">
                    {meal.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="text-white/70 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}