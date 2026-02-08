import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Award, Star, TrendingUp, ImageIcon, Heart,
  Coins, Lock, Check, Trophy, Loader2
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../AuthContext';
import { useGameStore } from '../gameStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfilePage() {
  const { user, token } = useAuth();
  const { achievements, fetchAchievements, movements, fetchMovements } = useGameStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.user_id) return;
      
      try {
        await Promise.all([
          fetchAchievements(user.user_id),
          fetchMovements()
        ]);

        const response = await fetch(`${API}/users/${user.user_id}/stats`, {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.user_id, token, fetchAchievements, fetchMovements]);

  const expProgress = stats ? (stats.experience % 100) : 0;
  const expNeeded = (stats?.level || 1) * 100;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getAchievementIcon = (icon) => {
    switch (icon) {
      case 'palette': return ImageIcon;
      case 'image': return ImageIcon;
      case 'images': return ImageIcon;
      case 'star': return Star;
      case 'crown': return Trophy;
      case 'trending-up': return TrendingUp;
      case 'award': return Award;
      case 'heart': return Heart;
      case 'shopping-bag': return Coins;
      default: return Award;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" data-testid="profile-page">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Profile header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 mb-8"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-[#FF8E53] text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold mb-1">{user?.username || user?.name}</h1>
                  <p className="text-muted-foreground mb-4">{user?.email}</p>
                  
                  {/* Level progress */}
                  <div className="max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-secondary">Level {stats?.level || 1}</span>
                      <span className="text-sm text-muted-foreground">{expProgress}/{expNeeded} XP</span>
                    </div>
                    <Progress value={(expProgress / expNeeded) * 100} className="h-3" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
                  <Coins className="w-5 h-5 text-accent" />
                  <span className="font-bold text-accent">{stats?.coins || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="glass-card p-4 text-center">
                <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats?.total_artworks || 0}</div>
                <div className="text-sm text-muted-foreground">Artworks</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{stats?.average_score?.toFixed(1) || 0}</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats?.total_likes || 0}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="glass-card p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{stats?.movements_tried || 0}</div>
                <div className="text-sm text-muted-foreground">Movements</div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Achievements
                </h2>
                <span className="text-sm text-muted-foreground">
                  {unlockedCount}/{achievements.length} unlocked
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = getAchievementIcon(achievement.icon);
                  const isUnlocked = achievement.unlocked;
                  
                  return (
                    <motion.div
                      key={achievement.achievement_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`glass-card p-4 flex items-center gap-4 ${
                        isUnlocked ? '' : 'opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-accent to-[#FFB800]'
                          : 'bg-muted'
                      }`}>
                        {isUnlocked ? (
                          <Icon className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold truncate">{achievement.name}</h3>
                          {isUnlocked && (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{achievement.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-accent">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{achievement.reward}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Movement progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Movement Unlocks
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movements.map((movement, index) => {
                  const isUnlocked = (stats?.level || 1) >= movement.unlock_level;
                  
                  return (
                    <motion.div
                      key={movement.movement_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`glass-card p-4 ${!isUnlocked ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{movement.name}</h3>
                        {isUnlocked ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {movement.color_palette.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isUnlocked ? 'Unlocked' : `Requires Level ${movement.unlock_level}`}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}