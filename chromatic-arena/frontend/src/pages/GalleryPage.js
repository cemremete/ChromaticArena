import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Heart, Eye, Calendar, Star, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GalleryPage() {
  const { user, token } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`${API}/artworks/gallery/${user.user_id}`, {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setArtworks(data.artworks || []);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [user?.user_id, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 40) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="gallery-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            My <span className="gradient-text">Gallery</span>
          </h1>
          <p className="text-muted-foreground">Your collection of masterpieces</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{artworks.length}</div>
            <div className="text-sm text-muted-foreground">Total Artworks</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {artworks.length > 0 
                ? Math.round(artworks.reduce((sum, a) => sum + (a.score || 0), 0) / artworks.length)
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {artworks.reduce((sum, a) => sum + (a.likes || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[#A8E6CF]">
              {artworks.reduce((sum, a) => sum + (a.views || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
        </motion.div>

        {/* Gallery grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : artworks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No artworks yet</h3>
            <p className="text-muted-foreground mb-6">Start creating to fill your gallery!</p>
            <a href="/atelier">
              <button className="btn-primary">Create Your First Artwork</button>
            </a>
          </motion.div>
        ) : (
          <div className="masonry-grid">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.artwork_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="masonry-item"
              >
                <div 
                  className="glass-card overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedArtwork(artwork)}
                >
                  {/* Artwork preview */}
                  <div 
                    className="aspect-square relative"
                    style={{
                      background: `linear-gradient(135deg, ${
                        artwork.canvas_data?.backgroundColor || '#f0f0f0'
                      } 0%, ${
                        artwork.canvas_data?.objects?.[0]?.fill || '#e0e0e0'
                      } 100%)`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white" />
                    </div>

                    {/* Score badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(artwork.score)}`}>
                      <Star className="w-3 h-3 inline mr-1" />
                      {Math.round(artwork.score)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{artwork.title}</h3>
                    <p className="text-sm text-primary mb-3">{artwork.movement_name}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {artwork.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {artwork.views || 0}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(artwork.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {selectedArtwork && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedArtwork.title}</h2>
                  <p className="text-primary">{selectedArtwork.movement_name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(selectedArtwork.score)}`}>
                  {Math.round(selectedArtwork.score)} pts
                </div>
              </div>

              {/* Score breakdown */}
              {selectedArtwork.score_breakdown && (
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2 text-muted-foreground">Score Breakdown:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedArtwork.score_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                        <span className="font-bold">{Math.round(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {selectedArtwork.likes || 0} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedArtwork.views || 0} views
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(selectedArtwork.created_at)}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}