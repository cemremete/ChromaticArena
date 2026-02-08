import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useGameStore } from '../gameStore';
import { useAuth } from '../AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LeaderboardPage() {
  const { leaderboard, fetchLeaderboard, movements, fetchMovements } = useGameStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('global');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaderboard('global'),
        fetchMovements()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchLeaderboard, fetchMovements]);

  const handleTabChange = async (value) => {
    setSelectedTab(value);
    setLoading(true);
    if (value === 'global') {
      await fetchLeaderboard('global');
    } else {
      const response = await fetch(`${API}/leaderboard/movement/${value}`);
      if (response.ok) {
        const data = await response.json();
        useGameStore.setState({ leaderboard: data });
      }
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30';
    return 'border-transparent hover:border-border';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" data-testid="leaderboard-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="font-medium text-accent">Top Artists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">See who's mastering the art movements</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="global" className="min-w-max">
              <TrendingUp className="w-4 h-4 mr-2" />
              Global
            </TabsTrigger>
            {movements.slice(0, 5).map((movement) => (
              <TabsTrigger key={movement.movement_id} value={movement.movement_id} className="min-w-max">
                {movement.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Be the first to top the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 0, 2].map((podiumIndex) => {
                const entry = leaderboard[podiumIndex];
                if (!entry) return <div key={podiumIndex} />;
                
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIndex * 0.1 }}
                    className={`glass-card p-6 text-center ${
                      podiumIndex === 0 ? 'order-2 -mt-4' : podiumIndex === 1 ? 'order-1' : 'order-3'
                    }`}
                  >
                    <div className="mb-3">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className={`w-16 h-16 mx-auto mb-3 border-4 ${
                      entry.rank === 1 ? 'border-yellow-500' :
                      entry.rank === 2 ? 'border-gray-400' : 'border-amber-600'
                    }`}>
                      <AvatarImage src={entry.avatar} alt={entry.username} />
                      <AvatarFallback className="text-xl">
                        {entry.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold truncate">{entry.username}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Level {entry.level}</p>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(entry.total_score)}
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.artworks_count} artworks</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of leaderboard */}
            {leaderboard.slice(3).map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.user_id;
              
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`glass-card p-4 flex items-center gap-4 border-2 ${
                    isCurrentUser ? 'border-primary bg-primary/5' : getRankBackground(entry.rank)
                  }`}
                >
                  <div className="w-10 text-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarImage src={entry.avatar} alt={entry.username} />
                    <AvatarFallback>
                      {entry.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{entry.username}</h3>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Level {entry.level} • {entry.artworks_count} artworks</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {Math.round(entry.total_score)}
                    </div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}