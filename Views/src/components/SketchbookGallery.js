import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const SketchbookGallery = () => {
  const [sketches, setSketches] = useState([]);
  const [flipped, setFlipped] = useState([]);

  useEffect(() => {
    const fetchSketches = async () => {
      try {
        const response = await axios.get("https://govind-jwellers.onrender.com/api/admin/sketch"); // Adjust API URL as needed
        setSketches(response.data);
        setFlipped(Array(response.data.length).fill(false));
      } catch (error) {
        console.error("Error fetching sketches:", error);
      }
    };
    fetchSketches();
  }, []);

  const toggleFlip = (index) => {
    setFlipped((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {Array.from({ length: Math.ceil(sketches.length / 3) }).map((_, rowIndex) => {
        const start = rowIndex * 3;
        const block = sketches.slice(start, start + 3);

        return (
          <div key={rowIndex} className="flex flex-wrap w-full h-[600px]">
            {/* First Image (Half Width) */}
            {block[0] && (
              <div className="w-1/2 h-full p-2">
                <motion.div
                  className="relative w-full h-full"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFlip(start)}
                >
                  <motion.div
                    className={`absolute w-full h-full rounded-lg shadow-lg transition-transform duration-500 ${
                      flipped[start] ? "rotate-y-180" : ""
                    }`}
                  >
                    {!flipped[start] ? (
                      <img
                        src={block[0]?.imageUrl}
                        alt={`Sketch ${block[0]?._id}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center rounded-lg text-white text-lg">
                        {block[0]?.name || "Unknown"}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* Two Images (Stacked in Second Half) */}
            <div className="w-1/2 flex flex-col">
              {block.slice(1, 3).map((image, idx) => (
                <div key={image._id} className="w-full h-1/2 p-2">
                  <motion.div
                    className="relative w-full h-full"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFlip(start + idx + 1)}
                  >
                    <motion.div
                      className={`absolute w-full h-full rounded-lg shadow-lg transition-transform duration-500 ${
                        flipped[start + idx + 1] ? "rotate-y-180" : ""
                      }`}
                    >
                      {!flipped[start + idx + 1] ? (
                        <img
                          src={image.imageUrl}
                          alt={`Sketch ${image._id}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center rounded-lg text-white text-lg">
                          {image.name || "Unknown"}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SketchbookGallery;