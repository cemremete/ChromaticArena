import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
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
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = selectedColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [selectedTool, selectedColor, brushSize]);

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
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Brush Size:</span>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            max={50}
            min={1}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{brushSize}px</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-container p-4">
        <canvas ref={canvasRef} className="border-2 border-border rounded-lg" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Artwork
        </Button>
        <Button variant="outline" onClick={downloadImage} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
};
