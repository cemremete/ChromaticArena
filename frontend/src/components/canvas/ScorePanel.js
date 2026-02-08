import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Award, Zap, Target, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/progress';

export const ScorePanel = ({ score, movement }) => {
  if (!score) {
    return (
      <div className="glass-card p-6 sticky top-24">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Score Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start creating and click "Calculate Score" to see your results!
          </p>
        </div>
      </div>
    );
  }

  const totalScore = Math.round(score.total_score);
  const maxScore = 150;
  const scorePercentage = (totalScore / maxScore) * 100;

  const getScoreRating = (score) => {
    if (score >= 120) return { label: 'Masterpiece!', color: 'text-yellow-500', icon: Award };
    if (score >= 100) return { label: 'Excellent!', color: 'text-green-500', icon: Zap };
    if (score >= 80) return { label: 'Great!', color: 'text-blue-500', icon: TrendingUp };
    if (score >= 60) return { label: 'Good', color: 'text-cyan-500', icon: Target };
    if (score >= 40) return { label: 'Fair', color: 'text-orange-500', icon: Star };
    return { label: 'Keep trying!', color: 'text-red-500', icon: AlertCircle };
  };

  const rating = getScoreRating(totalScore);
  const RatingIcon = rating.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={totalScore}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 sticky top-24"
      >
        {/* Total Score */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <RatingIcon className={`w-6 h-6 ${rating.color}`} />
            <span className={`text-lg font-bold ${rating.color}`}>
              {rating.label}
            </span>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl font-bold text-primary mb-2"
          >
            {totalScore}
          </motion.div>
          
          <p className="text-sm text-muted-foreground mb-3">out of {maxScore} points</p>
          
          <Progress value={scorePercentage} className="h-2" />
        </div>

        {/* Score Breakdown */}
        {score.breakdown && Object.keys(score.breakdown).length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-secondary" />
              Score Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(score.breakdown).map(([key, value]) => {
                const percentage = (value / 30) * 100; // Assuming max per category is 30
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-muted-foreground">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold">{Math.round(value)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gradient-to-r from-secondary to-[#44A08D] h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bonus Points */}
        {score.bonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="font-bold text-accent">Bonus Points!</p>
                <p className="text-xs text-muted-foreground">+{Math.round(score.bonus)} extra points</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        {score.feedback && score.feedback.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              AI Feedback
            </h4>
            <ul className="space-y-2">
              {score.feedback.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Movement Info */}
        {movement && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${movement.color_palette[0]} 0%, ${movement.color_palette[1] || movement.color_palette[0]} 100%)`
                }}
              />
              <div>
                <p className="font-bold text-sm">{movement.name}</p>
                <p className="text-xs text-muted-foreground">{movement.era}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};