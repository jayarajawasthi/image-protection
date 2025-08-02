import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Square,
  Circle,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";

const ImageBlurTool = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [blurType, setBlurType] = useState("rectangular");
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [showPreview, setShowPreview] = useState(true);
  const [blurArea, setBlurArea] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    radius: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);

  // Load default image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      calculateCanvasScale(img);
    };
    img.onerror = () => {
      console.warn("Failed to load default image");
    };
    img.src = "https://picsum.photos/600/400?random=1";
  }, /*[]*/);

  const calculateCanvasScale = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const containerWidth = canvas.parentElement.clientWidth - 40; // Account for padding
    const maxWidth = Math.min(containerWidth, 800);
    const scale = Math.min(1, maxWidth / img.width);
    setCanvasScale(scale);
  }, []);

  const drawCanvas = useCallback(
    (img, blur = null) => {
      const canvas = canvasRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply canvas scaling for display
      canvas.style.width = `${img.width * canvasScale}px`;
      canvas.style.height = `${img.height * canvasScale}px`;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw original image
      ctx.drawImage(img, 0, 0);

      if (blur && showPreview) {
        // Create temporary canvas for blur effect
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        // Draw image with blur on temp canvas
        tempCtx.filter = `blur(${blurIntensity}px)`;
        tempCtx.drawImage(img, 0, 0);

        // Create clipping path on main canvas
        ctx.save();

        if (blurType === "rectangular") {
          ctx.rect(blur.x, blur.y, blur.width, blur.height);
        } else {
          ctx.beginPath();
          ctx.arc(
            blur.x + blur.radius,
            blur.y + blur.radius,
            blur.radius,
            0,
            2 * Math.PI
          );
        }

        ctx.clip();
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      }

      // Draw selection outline
      drawSelectionOutline(ctx, blur || blurArea);
    },
    [blurType, blurIntensity, showPreview, canvasScale]
  );

  const drawSelectionOutline = useCallback(
    (ctx, area) => {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (blurType === "rectangular") {
        ctx.strokeRect(area.x, area.y, area.width, area.height);
        drawRectangleHandles(ctx, area);
      } else {
        ctx.beginPath();
        ctx.arc(
          area.x + area.radius,
          area.y + area.radius,
          area.radius,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        drawCircleHandle(ctx, area);
      }
    },
    [blurType]
  );

  const drawRectangleHandles = useCallback((ctx, area) => {
    ctx.fillStyle = "#3b82f6";
    ctx.setLineDash([]);
    const handleSize = 8;

    // Corner handles
    const handles = [
      { x: area.x, y: area.y }, // top-left
      { x: area.x + area.width, y: area.y }, // top-right
      { x: area.x, y: area.y + area.height }, // bottom-left
      { x: area.x + area.width, y: area.y + area.height }, // bottom-right
    ];

    handles.forEach((handle) => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }, []);

  const drawCircleHandle = useCallback((ctx, area) => {
    ctx.fillStyle = "#3b82f6";
    ctx.setLineDash([]);
    const handleSize = 8;
    ctx.fillRect(
      area.x + area.radius * 2 - handleSize / 2,
      area.y + area.radius - handleSize / 2,
      handleSize,
      handleSize
    );
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          calculateCanvasScale(img);
          // Reset blur area to reasonable defaults for new image
          const newBlurArea = {
            x: Math.floor(img.width * 0.2),
            y: Math.floor(img.height * 0.2),
            width: Math.floor(img.width * 0.3),
            height: Math.floor(img.height * 0.3),
            radius: Math.floor(Math.min(img.width, img.height) * 0.15),
          };
          setBlurArea(newBlurArea);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / canvasScale,
      y: (e.clientY - rect.top) / canvasScale,
    };
  };

  const getResizeHandle = (x, y) => {
    const handleSize = 8 / canvasScale;

    if (blurType === "rectangular") {
      const handles = [
        { id: "tl", x: blurArea.x, y: blurArea.y },
        { id: "tr", x: blurArea.x + blurArea.width, y: blurArea.y },
        { id: "bl", x: blurArea.x, y: blurArea.y + blurArea.height },
        {
          id: "br",
          x: blurArea.x + blurArea.width,
          y: blurArea.y + blurArea.height,
        },
      ];

      for (const handle of handles) {
        if (
          Math.abs(x - handle.x) <= handleSize &&
          Math.abs(y - handle.y) <= handleSize
        ) {
          return handle.id;
        }
      }
    } else {
      const handleX = blurArea.x + blurArea.radius * 2;
      const handleY = blurArea.y + blurArea.radius;
      if (
        Math.abs(x - handleX) <= handleSize &&
        Math.abs(y - handleY) <= handleSize
      ) {
        return "circle";
      }
    }
    return null;
  };

  const isInsideBlurArea = (x, y) => {
    if (blurType === "rectangular") {
      return (
        x >= blurArea.x &&
        x <= blurArea.x + blurArea.width &&
        y >= blurArea.y &&
        y <= blurArea.y + blurArea.height
      );
    } else {
      const centerX = blurArea.x + blurArea.radius;
      const centerY = blurArea.y + blurArea.radius;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      return distance <= blurArea.radius;
    }
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePosition(e);

    // Check for resize handles first
    const handleId = getResizeHandle(x, y);
    if (handleId) {
      setIsResizing(true);
      setResizeHandle(handleId);
      return;
    }

    // Check if clicking inside blur area for dragging
    if (isInsideBlurArea(x, y)) {
      setIsDragging(true);
      setDragStart({ x: x - blurArea.x, y: y - blurArea.y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const { x, y } = getMousePosition(e);

    if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(
          x - dragStart.x,
          canvas.width -
            (blurType === "rectangular" ? blurArea.width : blurArea.radius * 2)
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          y - dragStart.y,
          canvas.height -
            (blurType === "rectangular" ? blurArea.height : blurArea.radius * 2)
        )
      );

      setBlurArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      handleResize(x, y);
    } else {
      // Update cursor based on hover state
      const handleId = getResizeHandle(x, y);
      if (handleId) {
        canvas.style.cursor = getResizeCursor(handleId);
      } else if (isInsideBlurArea(x, y)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "crosshair";
      }
    }
  };

  const getResizeCursor = (handleId) => {
    switch (handleId) {
      case "tl":
      case "br":
        return "nw-resize";
      case "tr":
      case "bl":
        return "ne-resize";
      case "circle":
        return "e-resize";
      default:
        return "crosshair";
    }
  };

  const handleResize = (x, y) => {
    const canvas = canvasRef.current;

    if (blurType === "rectangular") {
      setBlurArea((prev) => {
        let newArea = { ...prev };

        switch (resizeHandle) {
          case "tl":
            newArea.width = Math.max(50, prev.x + prev.width - x);
            newArea.height = Math.max(50, prev.y + prev.height - y);
            newArea.x = Math.max(0, Math.min(x, prev.x + prev.width - 50));
            newArea.y = Math.max(0, Math.min(y, prev.y + prev.height - 50));
            break;
          case "tr":
            newArea.width = Math.max(
              50,
              Math.min(x - prev.x, canvas.width - prev.x)
            );
            newArea.height = Math.max(50, prev.y + prev.height - y);
            newArea.y = Math.max(0, Math.min(y, prev.y + prev.height - 50));
            break;
          case "bl":
            newArea.width = Math.max(50, prev.x + prev.width - x);
            newArea.height = Math.max(
              50,
              Math.min(y - prev.y, canvas.height - prev.y)
            );
            newArea.x = Math.max(0, Math.min(x, prev.x + prev.width - 50));
            break;
          case "br":
            newArea.width = Math.max(
              50,
              Math.min(x - prev.x, canvas.width - prev.x)
            );
            newArea.height = Math.max(
              50,
              Math.min(y - prev.y, canvas.height - prev.y)
            );
            break;
        }

        return newArea;
      });
    } else {
      const centerX = blurArea.x + blurArea.radius;
      const centerY = blurArea.y + blurArea.radius;
      const newRadius = Math.max(
        25,
        Math.min(
          Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2),
          Math.min(canvas.width - blurArea.x, canvas.height - blurArea.y) / 2
        )
      );
      setBlurArea((prev) => ({ ...prev, radius: newRadius }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const resetImage = () => {
    if (image) {
      drawCanvas(image);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      // Create a final canvas with the blur applied
      const finalCanvas = document.createElement("canvas");
      const finalCtx = finalCanvas.getContext("2d");
      finalCanvas.width = image.width;
      finalCanvas.height = image.height;

      // Draw the image with blur effect
      finalCtx.drawImage(image, 0, 0);

      // Apply blur to the selected area
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;

      tempCtx.filter = `blur(${blurIntensity}px)`;
      tempCtx.drawImage(image, 0, 0);

      finalCtx.save();
      if (blurType === "rectangular") {
        finalCtx.rect(blurArea.x, blurArea.y, blurArea.width, blurArea.height);
      } else {
        finalCtx.beginPath();
        finalCtx.arc(
          blurArea.x + blurArea.radius,
          blurArea.y + blurArea.radius,
          blurArea.radius,
          0,
          2 * Math.PI
        );
      }
      finalCtx.clip();
      finalCtx.drawImage(tempCanvas, 0, 0);
      finalCtx.restore();

      const link = document.createElement("a");
      link.download = `blurred-image-${Date.now()}.png`;
      link.href = finalCanvas.toDataURL("image/png", 1.0);
      link.click();
    }
  };

  // Update canvas when dependencies change
  useEffect(() => {
    if (image) {
      drawCanvas(image, showPreview ? blurArea : null);
    }
  }, [image, blurArea, blurType, blurIntensity, showPreview, drawCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (image) {
        calculateCanvasScale(image);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [image, calculateCanvasScale]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Image Blur Tool
          </h1>
          <p className="text-gray-600">
            Upload an image and selectively blur areas with precision
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-700 mb-2">
                Click to upload an image or drag and drop
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Choose Image
              </button>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Blur Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Blur Shape
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBlurType("rectangular")}
                className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all ${
                  blurType === "rectangular"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Square size={16} className="mr-2" />
                Rectangle
              </button>
              <button
                onClick={() => setBlurType("circular")}
                className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all ${
                  blurType === "circular"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Circle size={16} className="mr-2" />
                Circle
              </button>
            </div>
          </div>

          {/* Blur Intensity */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Blur Intensity
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="30"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Light</span>
                <span className="font-medium">{blurIntensity}px</span>
                <span>Strong</span>
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Preview
            </label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center justify-center w-full px-3 py-2 rounded-lg font-medium transition-all ${
                showPreview
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {showPreview ? (
                <Eye size={16} className="mr-2" />
              ) : (
                <EyeOff size={16} className="mr-2" />
              )}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Actions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={resetImage}
                className="flex items-center justify-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                <RotateCcw size={16} className="mr-1" />
                Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={!image}
                className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Download size={16} className="mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How to use:</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Click and drag inside the selection to move the blur area
                  </li>
                  <li>
                    Click and drag the corner handles (rectangle) or edge handle
                    (circle) to resize
                  </li>
                  <li>
                    Use the preview toggle to see the blur effect in real-time
                  </li>
                  <li>
                    Adjust blur intensity with the slider for the desired effect
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full h-auto cursor-crosshair block mx-auto"
          />
        </div>

        {/* Status Info */}
        {image && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <div>
              <strong>Image:</strong> {image.width} × {image.height} pixels
            </div>
            <div>
              <strong>Blur area:</strong>{" "}
              {blurType === "rectangular"
                ? `${Math.round(blurArea.width)} × ${Math.round(
                    blurArea.height
                  )} at (${Math.round(blurArea.x)}, ${Math.round(blurArea.y)})`
                : `radius ${Math.round(blurArea.radius)} at (${Math.round(
                    blurArea.x + blurArea.radius
                  )}, ${Math.round(blurArea.y + blurArea.radius)})`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBlurTool;
