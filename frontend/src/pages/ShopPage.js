import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Coins, Check, Lock, Star,
  Brush, Square, Circle, Hexagon, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../AuthContext';
import { useGameStore } from '../gameStore';
import { toast } from 'sonner';

export default function ShopPage() {
  const { user } = useAuth();
  const { tools, fetchTools, purchaseTool } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    const loadShop = async () => {
      await fetchTools();
      setLoading(false);
    };
    loadShop();
  }, [fetchTools]);

  const handlePurchase = async (tool) => {
    if ((user?.coins || 0) < tool.price) {
      toast.error("Not enough coins!");
      return;
    }

    setPurchasing(tool.tool_id);
    
    try {
      await purchaseTool(tool.tool_id, localStorage.getItem('token'));
      toast.success(`${tool.name} purchased!`);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'Legendary': return 'border-yellow-500 shadow-lg shadow-yellow-500/30';
      case 'Epic': return 'border-purple-500 shadow-lg shadow-purple-500/30';
      case 'Rare': return 'border-blue-500 shadow-lg shadow-blue-500/30';
      default: return 'border-border';
    }
  };

  const getRarityBadge = (rarity) => {
    switch(rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      case 'Epic': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'Rare': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'brush': Brush,
      'square': Square,
      'circle': Circle,
      'hexagon': Hexagon,
      'sparkles': Sparkles
    };
    return icons[iconName] || Brush;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">Item Shop</span>
            </h1>
            <p className="text-muted-foreground">Upgrade your creative arsenal</p>
          </div>
          
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-[#FFB800] rounded-full shadow-lg">
            <Coins className="w-6 h-6 text-white" />
            <span className="font-bold text-xl text-white">{user?.coins || 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Shop items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((item, index) => {
                const Icon = getIconComponent(item.icon);
                const isPurchased = item.owned;
                const isPurchasing = purchasing === item.tool_id;
                
                return (
                  <motion.div
                    key={item.tool_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`relative group glass-card p-6 border-2 ${
                      isPurchased 
                        ? 'border-green-500 shadow-lg shadow-green-500/30' 
                        : getRarityColor(item.rarity)
                    }`}
                  >
                    {/* Rarity badge */}
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${getRarityBadge(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </div>

                    {/* Item icon */}
                    <div className="flex items-center justify-center mb-6">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg ${
                          isPurchased
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : item.rarity === 'Legendary'
                            ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                            : item.rarity === 'Epic'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                            : item.rarity === 'Rare'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}
                      >
                        <Icon className="w-12 h-12 text-white" />
                      </motion.div>
                    </div>

                    {/* Item details */}
                    <h3 className="text-xl font-bold mb-2 text-center">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} tool
                    </p>

                    {/* Price & action */}
                    <div className="flex items-center justify-between gap-3">
                      {item.price === 0 ? (
                        <div className="flex-1 px-4 py-2 bg-accent/20 rounded-full text-center">
                          <span className="font-bold text-accent">FREE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
                          <Coins className="w-5 h-5 text-accent" />
                          <span className="font-bold text-accent">{item.price}</span>
                        </div>
                      )}

                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={isPurchased || isPurchasing || (user?.coins || 0) < item.price}
                        variant={isPurchased ? 'secondary' : 'default'}
                        size="sm"
                        className={isPurchased ? 'bg-green-500 hover:bg-green-600 text-white border-0' : ''}
                      >
                        {isPurchasing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isPurchased ? (
                          <>
                            <Check className="w-4 h-4" />
                            Owned
                          </>
                        ) : (user?.coins || 0) < item.price ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Locked
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Buy
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Purchased overlay */}
                    {isPurchased && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-green-500/10 rounded-3xl pointer-events-none"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Coming soon section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 px-6 py-3 rounded-full">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-purple-500 dark:text-purple-400 font-medium">
                  More items coming soon!
                </span>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}