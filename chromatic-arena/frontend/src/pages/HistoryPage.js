import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Palette, BookOpen, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useGameStore } from '../gameStore';

export default function HistoryPage() {
  const { movements, fetchMovements, loadingMovements } = useGameStore();

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Historical context for each movement
  const movementDetails = {
    minimalism: {
      history: 'Minimalism emerged in New York in the early 1960s. Artists like Donald Judd, Frank Stella, and Dan Flavin stripped art down to its essential elements, rejecting the emotional intensity of Abstract Expressionism.',
      keyArtists: ['Donald Judd', 'Frank Stella', 'Dan Flavin', 'Sol LeWitt'],
      principles: ['Less is more', 'Geometric forms', 'Industrial materials', 'Objective approach']
    },
    pop_art: {
      history: 'Pop Art originated in Britain in the mid-1950s and later emerged in New York. Artists like Andy Warhol and Roy Lichtenstein drew inspiration from popular culture, advertising, and mass media.',
      keyArtists: ['Andy Warhol', 'Roy Lichtenstein', 'Jasper Johns', 'James Rosenquist'],
      principles: ['Mass culture imagery', 'Bold colors', 'Repetition', 'Irony and wit']
    },
    cubism: {
      history: 'Cubism was developed between 1907 and 1914 by Pablo Picasso and Georges Braque. It revolutionized European painting by representing objects from multiple viewpoints simultaneously.',
      keyArtists: ['Pablo Picasso', 'Georges Braque', 'Juan Gris', 'Fernand Léger'],
      principles: ['Multiple perspectives', 'Geometric fragmentation', 'Muted colors', 'Flattened space']
    },
    surrealism: {
      history: 'Surrealism began in the 1920s in Paris. Influenced by Sigmund Freud\'s theories, artists like Salvador Dalí and René Magritte explored the unconscious mind through dreamlike imagery.',
      keyArtists: ['Salvador Dalí', 'Ren   Magritte', 'Max Ernst', 'Joan Miró'],
      principles: ['Unconscious expression', 'Dream imagery', 'Unexpected juxtapositions', 'Symbolic elements']
    },
    impressionism: {
      history: 'Impressionism began in Paris in the 1860s. Claude Monet, Pierre-Auguste Renoir, and others sought to capture light and movement, painting outdoors to record fleeting moments.',
      keyArtists: ['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Camille Pissarro'],
      principles: ['Visible brushstrokes', 'Light emphasis', 'Outdoor painting', 'Everyday subjects']
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" data-testid="history-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full mb-4">
            <BookOpen className="w-5 h-5 text-secondary" />
            <span className="font-medium text-secondary">Learn & Create</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Art <span className="gradient-text">History</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover the rich history behind each art movement. Understanding their origins 
            will help you create more authentic artworks.
          </p>
        </motion.div>

        {loadingMovements ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {movements.map((movement, index) => {
              const details = movementDetails[movement.movement_id] || {};
              
              return (
                <motion.div
                  key={movement.movement_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Color palette sidebar */}
                    <div 
                      className="lg:w-48 p-6 flex lg:flex-col gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${movement.color_palette[0]}20 0%, ${movement.color_palette[1] || movement.color_palette[0]}20 100%)`
                      }}
                    >
                      <div className="flex lg:flex-col gap-2 flex-wrap">
                        {movement.color_palette.map((color, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-xl border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{movement.name}</h2>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{movement.era}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          movement.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                          movement.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}>
                          {movement.difficulty}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {movement.description}
                      </p>

                      {details.history && (
                        <div className="mb-4">
                          <h3 className="font-bold text-sm text-primary mb-2">History</h3>
                          <p className="text-sm text-muted-foreground">
                            {details.history}
                          </p>
                        </div>
                      )}

                      {details.keyArtists && (
                        <div className="mb-4">
                          <h3 className="font-bold text-sm text-secondary mb-2">Key Artists</h3>
                          <div className="flex flex-wrap gap-2">
                            {details.keyArtists.map((artist, i) => (
                              <span key={i} className="text-sm px-3 py-1 bg-secondary/10 text-secondary rounded-full">
                                {artist}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-sm text-accent mb-2">Rules to Follow</h3>
                        <div className="flex flex-wrap gap-2">
                          {movement.rules.map((rule, i) => (
                            <span key={i} className="text-sm px-3 py-1 bg-muted rounded-full">
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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