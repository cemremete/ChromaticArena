import { create } from 'zustand';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export const useGameStore = create((set, get) => ({
  // State
  movements: [],
  selectedMovement: null,
  loadingMovements: false,
  
  currentCanvas: null,
  currentScore: null,
  
  tools: [],
  inventory: [],
  selectedTool: null,
  
  leaderboard: [],
  achievements: [],
  dailyChallenge: null,
  
  // Actions
  fetchMovements: async () => {
    set({ loadingMovements: true });
    try {
      const response = await fetch(`${API}/movements`);
      const data = await response.json();
      set({ movements: data, loadingMovements: false });
    } catch (error) {
      console.error('Failed to fetch movements:', error);
      set({ loadingMovements: false });
    }
  },
  
  selectMovement: (movement) => {
    set({ selectedMovement: movement });
  },
  
  setCurrentCanvas: (canvas) => {
    set({ currentCanvas: canvas });
  },
  
  calculateScore: async (canvasData, movementId) => {
    try {
      const res = await fetch(`${API}/score/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas_data: canvasData, movement_id: movementId })
      });
      const data = await res.json();
      set({ currentScore: data });
      return data;
    } catch (error) {
      console.error('Failed to calculate score:', error);
      return null;
    }
  },
  
  saveArtwork: async (canvasData, movementId, title, token) => {
    try {
      const response = await fetch(`${API}/artworks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify({
          canvas_data: canvasData,
          movement_id: movementId,
          title: title || 'Untitled Masterpiece'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save artwork');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  },
  
  fetchTools: async () => {
    try {
      const res = await fetch(`${API}/shop/tools`, {
        credentials: 'include'
      });
      const data = await res.json();
      set({ tools: data });
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  },
  
  fetchInventory: async (token) => {
    try {
      const response = await fetch(`${API}/shop/inventory`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        set({ inventory: data.inventory || [] });
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  },
  
  selectTool: (tool) => {
    set({ selectedTool: tool });
  },
  
  purchaseTool: async (toolId, token) => {
    try {
      const res = await fetch(`${API}/shop/purchase/${toolId}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Purchase failed');
      }
      
      const data = await res.json();
      
      // Refresh tools list
      await get().fetchTools();
      
      return data;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  },
  
  fetchLeaderboard: async (type = 'global') => {
    try {
      const endpoint = type === 'global' 
        ? `${API}/leaderboard/global`
        : `${API}/leaderboard/movement/${type}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      set({ leaderboard: data });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  },
  
  fetchAchievements: async (userId) => {
    try {
      const response = await fetch(`${API}/achievements/user/${userId}`);
      const data = await response.json();
      set({ achievements: data });
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  },
  
  fetchDailyChallenge: async () => {
    try {
      const response = await fetch(`${API}/challenges/today`, {
        credentials: 'include'
      });
      const data = await response.json();
      set({ dailyChallenge: data });
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error);
    }
  },
  
  resetScore: () => {
    set({ currentScore: null });
  }
}));