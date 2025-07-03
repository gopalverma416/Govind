import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

const Slideshow = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/admin/slideshow");
        const data = await response.json();
        if (response.ok) {
          setSlides(data);
        } else {
          console.error("Failed to fetch slides");
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      }
    };

    fetchSlides();
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  // Swipe functionality
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length),
    onSwipedRight: () =>
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? slides.length - 1 : prevIndex - 1
      ),
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className="relative w-full h-[75vh] overflow-hidden flex items-center justify-center bg-black"
    >
      {slides.length > 0 ? (
        <>
          {/* Slideshow images */}
          <div className="absolute inset-0 flex items-center justify-center">
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide.imageUrl}
                alt="Slideshow"
                className={`absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out transform ${
                  index === currentIndex ? "opacity-100 scale-105" : "opacity-0 scale-95"
                }`}
              />
            ))}
          </div>

          {/* Dark overlay for better visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Dots navigation */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "bg-white scale-125 shadow-lg" : "bg-gray-500"
                }`}
                onClick={() => setCurrentIndex(index)}
              ></button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-white text-lg">No slides available</p>
      )}
    </div>
  );
};

export default Slideshow;
