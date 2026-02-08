import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { 
  Brush, Square, Circle, Trash2, Download, RotateCcw,
  Palette, Save, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ArtCanvas = ({ movement, onScoreUpdate, onSave }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#FFFFFF',
      isDrawingMode: false,
    });

    fabricCanvasRef.current = canvas;

    // Canvas change listener for real-time scoring
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update drawing mode when tool changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (selectedTool === 'brush') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = selectedColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [selectedTool, selectedColor, brushSize]);

  const handleCanvasChange = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasData = {
      objects: canvas.getObjects().map(obj => ({
        type: obj.type,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        width: obj.width || obj.radius * 2,
        height: obj.height || obj.radius * 2,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
      })),
      width: canvas.width,
      height: canvas.height,
      backgroundColor: canvas.backgroundColor
    };

    if (onScoreUpdate) {
      onScoreUpdate(canvasData);
    }
  };

  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: selectedColor,
      width: 100,
      height: 100,
      stroke: '#000',
      strokeWidth: 2
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: selectedColor,
      radius: 50,
      stroke: '#000',
      strokeWidth: 2
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addTriangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      fill: selectedColor,
      width: 100,
      height: 100,
      stroke: '#000',
      strokeWidth: 2
    });

    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#FFFFFF';
    canvas.renderAll();
    handleCanvasChange();
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleSave = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !onSave) return;

    const canvasData = {
      objects: canvas.getObjects().map(obj => obj.toObject()),
      width: canvas.width,
      height: canvas.height,
      backgroundColor: canvas.backgroundColor
    };

    onSave(canvasData);
  };

  const downloadImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });

    const link = document.createElement('a');
    link.download = `artwork-${movement?.name || 'untitled'}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Drawing tools */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={selectedTool === 'brush' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('brush')}
              title="Brush"
            >
              <Brush className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('select')}
              title="Select"
            >
              <Move className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-border" />

          {/* Shape tools */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={addRectangle}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addCircle}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addTriangle}
              title="Triangle"
            >
              ▲
            </Button>
          </div>

          <div className="w-px h-8 bg-border" />

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={deleteSelected}
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearCanvas}
              title="Clear All"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Color palette from movement */}
          <div className="flex gap-1">
            {movement?.color_palette?.slice(0, 6).map((color, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === color ? 'border-white shadow-lg scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer"
              title="Custom color"
            />
          </div>
        </div>

        {/* Brush size slider */}
        {selectedTool === 'brush' && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Brush Size:</span>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={50}
              step={1}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm text-muted-foreground w-12">{brushSize}px</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="glass-card p-4">
        <div className="canvas-container bg-white rounded-xl overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={downloadImage}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleCanvasChange}
            className="gap-2"
          >
            <Palette className="w-4 h-4" />
            Calculate Score
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 bg-gradient-to-r from-primary to-[#FF8E53]"
          >
            <Save className="w-4 h-4" />
            Save Artwork
          </Button>
        </div>
      </div>

      {/* Movement rules reminder */}
      {movement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 bg-secondary/5"
        >
          <h4 className="font-bold text-sm text-secondary mb-2">
            {movement.name} Rules:
          </h4>
          <div className="flex flex-wrap gap-2">
            {movement.rules.map((rule, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
              >
                {rule}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};