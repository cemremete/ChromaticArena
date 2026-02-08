import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Info, Save, Sparkles, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Navbar } from '../components/layout/Navbar';
import { ArtCanvas } from '../components/canvas/ArtCanvas';
import { ScorePanel } from '../components/canvas/ScorePanel';
import { MovementCard } from '../components/MovementCard';
import { useAuth } from '../AuthContext';
import { useGameStore } from '../gameStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

export default function AtelierPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { 
    movements, fetchMovements, selectedMovement, selectMovement,
    currentScore, calculateScore, saveArtwork, resetScore
  } = useGameStore();
  
  const [showMovementSelect, setShowMovementSelect] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingCanvasData, setPendingCanvasData] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    fetchMovements();
    resetScore();
  }, [fetchMovements, resetScore]);

  useEffect(() => {
    const movementId = searchParams.get('movement');
    if (movementId && movements.length > 0) {
      const movement = movements.find(m => m.movement_id === movementId);
      if (movement) {
        selectMovement(movement);
        setShowMovementSelect(false);
      }
    }
  }, [searchParams, movements, selectMovement]);

  const handleMovementSelect = (movement) => {
    if ((user?.level || 1) < movement.unlock_level) {
      toast.error(`You need to be level ${movement.unlock_level} to unlock ${movement.name}`);
      return;
    }
    selectMovement(movement);
    setShowMovementSelect(false);
    resetScore();
  };

  const handleScoreUpdate = useCallback((canvasData) => {
    if (selectedMovement) {
      calculateScore(canvasData, selectedMovement.movement_id);
    }
  }, [selectedMovement, calculateScore]);

  const handleSave = (canvasData) => {
    setPendingCanvasData(canvasData);
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingCanvasData || !selectedMovement) return;
    
    setSaving(true);
    try {
      const result = await saveArtwork(
        pendingCanvasData,
        selectedMovement.movement_id,
        artworkTitle || 'Untitled Masterpiece',
        token
      );
      
      setSaveResult(result);
      toast.success('Artwork saved successfully!');
      
      if (result.experience_gained) {
        toast.success(`+${result.experience_gained} XP gained!`);
      }
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save artwork');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseResultDialog = () => {
    setShowSaveDialog(false);
    setSaveResult(null);
    setArtworkTitle('');
    setPendingCanvasData(null);
  };

  const handleViewGallery = () => {
    handleCloseResultDialog();
    navigate('/gallery');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="atelier-page">
        <AnimatePresence mode="wait">
          {showMovementSelect ? (
            <motion.div
              key="movement-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Choose Your <span className="gradient-text">Art Movement</span>
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Each art movement has unique rules and tools. Your artwork will be scored 
                  based on how well it follows the movement's principles.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {movements.map((movement, index) => (
                  <motion.div
                    key={movement.movement_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MovementCard
                      movement={movement}
                      userLevel={user?.level || 1}
                      onClick={handleMovementSelect}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowMovementSelect(true);
                      resetScore();
                    }}
                    className="flex items-center gap-2"
                    data-testid="back-to-movements"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedMovement?.name}</h1>
                    <p className="text-sm text-muted-foreground">{selectedMovement?.era}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMovement?.color_palette?.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Canvas and score */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ArtCanvas
                    movement={selectedMovement}
                    onScoreUpdate={handleScoreUpdate}
                    onSave={handleSave}
                  />
                </div>
                <div>
                  <ScorePanel 
                    score={currentScore} 
                    movement={selectedMovement}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md">
            {!saveResult ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Save className="w-5 h-5 text-primary" />
                    Save Your Artwork
                  </DialogTitle>
                  <DialogDescription>
                    Give your masterpiece a title before saving it to your gallery.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter artwork title..."
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    className="rounded-xl"
                    data-testid="artwork-title-input"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-primary to-[#FF8E53] text-white"
                      data-testid="confirm-save-btn"
                    >
                      {saving ? 'Saving...' : 'Save Artwork'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                    Artwork Saved!
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold text-primary mb-2"
                    >
                      {Math.round(saveResult.score)}
                    </motion.div>
                    <p className="text-muted-foreground">Final Score</p>
                  </div>

                  {saveResult.experience_gained > 0 && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-secondary/10 rounded-xl">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <span className="font-bold text-secondary">
                        +{saveResult.experience_gained} XP earned!
                      </span>
                    </div>
                  )}

                  {saveResult.feedback && saveResult.feedback.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm">Feedback:</h4>
                      {saveResult.feedback.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{item}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseResultDialog}
                      className="flex-1"
                    >
                      Create Another
                    </Button>
                    <Button
                      onClick={handleViewGallery}
                      className="flex-1 bg-gradient-to-r from-secondary to-[#556270] text-white"
                    >
                      View Gallery
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}