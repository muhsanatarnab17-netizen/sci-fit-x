import { motion } from "framer-motion";
import { Utensils, Zap, Clock, ChevronRight } from "lucide-react";

interface MealCardProps {
  type: string; // e.g., "Breakfast"
  name: string; // e.g., "Atta Ruti with Daal"
  calories: number;
  image: string; // URL from the internet
  protein: string;
  onClick?: () => void; // 🌟 Added: Optional click handler
}

export default function GlassMealCard({ 
  type, 
  name, 
  calories, 
  image, 
  protein, 
  onClick 
}: MealCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} // 🌟 Added: Triggers the modal open logic
      className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/20 shadow-xl group cursor-pointer" // 🌟 Added: cursor-pointer
    >
      {/* Background Image with Opacity Adjustment */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url('${image}')` }}
      />
      
      {/* The Glass Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] group-hover:backdrop-blur-sm transition-all duration-300" />

      {/* Content Layer */}
      <div className="relative h-full p-4 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/80 px-2 py-1 rounded-md backdrop-blur-md">
            {type}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-medium bg-black/40 px-2 py-1 rounded-full border border-white/10">
            <Zap className="w-3 h-3 text-yellow-400" />
            {calories} kcal
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold leading-tight drop-shadow-md">{name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center text-[10px] text-white/80">
              <Utensils className="w-3 h-3 mr-1" />
              {protein} Protein
            </div>
            <div className="flex items-center text-[10px] text-white/80">
              <Clock className="w-3 h-3 mr-1" />
              15 min
            </div>
          </div>
        </div>

        {/* View Recipe Trigger Button */}
        <motion.div 
          className="absolute bottom-4 right-4 p-2 bg-white/10 group-hover:bg-primary group-hover:text-black rounded-full border border-white/20 backdrop-blur-md transition-all duration-300"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}