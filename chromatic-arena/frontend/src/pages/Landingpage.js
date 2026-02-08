import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Palette, Trophy, Users, Sparkles, Zap, Target, 
  Star, TrendingUp, Award, Heart, ArrowRight, Brush,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Palette,
      title: 'Create Art',
      description: 'Express yourself through different art movements with intuitive tools',
      color: 'from-primary to-[#FF8E53]'
    },
    {
      icon: Trophy,
      title: 'Compete',
      description: 'Challenge yourself with daily tasks and compete on global leaderboards',
      color: 'from-secondary to-[#44A08D]'
    },
    {
      icon: Star,
      title: 'Learn',
      description: 'Discover art history and master techniques from famous movements',
      color: 'from-accent to-primary'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Share your artworks and get inspired by other artists',
      color: 'from-[#A8E6CF] to-secondary'
    }
  ];

  const movements = [
    { name: 'Minimalism', color: '#808080', desc: 'Less is more' },
    { name: 'Pop Art', color: '#FF6347', desc: 'Bold & vibrant' },
    { name: 'Cubism', color: '#8B4513', desc: 'Multiple perspectives' },
    { name: 'Surrealism', color: '#9370DB', desc: 'Dreamlike imagery' },
    { name: 'Impressionism', color: '#87CEEB', desc: 'Capture light' }
  ];

  const stats = [
    { value: '10K+', label: 'Artworks Created' },
    { value: '500+', label: 'Active Artists' },
    { value: '50+', label: 'Daily Challenges' },
    { value: '5', label: 'Art Movements' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A2E]/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Palette className="w-6 h-6 text-white" />
              </motion.div>
              <span className="font-bold text-xl hidden sm:block">
                <span className="text-primary">Chromatic</span>
                <span className="text-secondary">Arena</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-40 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 3s' }} />
        
        <div className="noise-overlay" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Create. Compete. Master Art.</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Unleash Your{' '}
              <span className="gradient-text">Creativity</span>
              <br />
              in the Art Arena
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Master different art movements, compete with artists worldwide, and climb the leaderboard 
              as you create stunning artworks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/history">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="gradient-text">Chromatic Arena</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The ultimate platform for art enthusiasts to learn, create, and compete
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="glass-card p-6 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Art movements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Master <span className="gradient-text">5 Art Movements</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each movement has unique rules and scoring. Learn the principles and create authentic artworks.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {movements.map((movement, index) => (
              <motion.div
                key={movement.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 text-center cursor-pointer"
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  style={{ backgroundColor: movement.color }}
                />
                <h3 className="font-bold mb-1">{movement.name}</h3>
                <p className="text-sm text-muted-foreground">{movement.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '1', 
                title: 'Choose Movement', 
                desc: 'Select from 5 iconic art movements',
                icon: Palette
              },
              { 
                step: '2', 
                title: 'Create Art', 
                desc: 'Use our tools to create your masterpiece',
                icon: Brush
              },
              { 
                step: '3', 
                title: 'Get Scored', 
                desc: 'AI judges your work based on movement rules',
                icon: Trophy
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    <Icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Create Your <span className="gradient-text">Masterpiece</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of artists creating, learning, and competing in the Chromatic Arena
            </p>
            <Link to="/register">
              <Button size="lg" className="h-14 px-10 text-lg">
                Start Your Journey
                <Sparkles className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-white/50 dark:bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-primary">Chromatic</span>
                <span className="text-secondary">Arena</span>
              </span>
            </div>
            
            <div className="flex gap-6">
              <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                Art History
              </Link>
              <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Chromatic Arena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
}