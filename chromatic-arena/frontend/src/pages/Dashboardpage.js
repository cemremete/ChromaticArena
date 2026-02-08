import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Palette, Trophy, Star, Zap, Target, TrendingUp,
  Users, Clock, Award, Brush, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/layout/Navbar';

const DashboardPage = () => {
  const [userStats, setUserStats] = useState({
    level: 12,
    experience: 2850,
    coins: 1250,
    artworks: 24,
    achievements: 8,
    rank: 15
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'artwork', title: 'Sunset Dreams', time: '2 hours ago', points: 150 },
    { id: 2, type: 'achievement', title: 'Color Master', time: '1 day ago', points: 100 },
    { id: 3, type: 'challenge', title: 'Weekly Challenge', time: '2 days ago', points: 200 }
  ]);

  const quickActions = [
    { icon: Brush, label: 'Create Art', href: '/atelier', color: 'from-primary to-[#FF8E53]' },
    { icon: Trophy, label: 'Challenges', href: '/challenges', color: 'from-[#4ECDC4] to-[#44A08D]' },
    { icon: Star, label: 'Gallery', href: '/gallery', color: 'from-[#FFE66D] to-primary' },
    { icon: Users, label: 'Community', href: '/leaderboard', color: 'from-[#A8E6CF] to-[#4ECDC4]' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      
      <div className="bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Artist!</p>
              </div>
            </div>
            
            <Link to="/profile">
              <Button className="bg-gradient-to-r from-primary to-[#FF8E53] text-white">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">#{userStats.rank}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Global Rank</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.level}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.coins}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Coins</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.artworks}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Artworks</h3>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className={`block bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-bold">{action.label}</h3>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent activity and progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{activity.points}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-6">Progress Overview</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Level {userStats.level}</span>
                  <span className="text-sm text-muted-foreground">{userStats.experience}/3000 XP</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-[#FF8E53] h-3 rounded-full"
                    style={{ width: `${(userStats.experience / 3000) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold text-purple-600">{userStats.achievements}</h3>
                  <p className="text-xs text-purple-500">Achievements</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-green-600">Active</h3>
                  <p className="text-xs text-green-500">Status</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;