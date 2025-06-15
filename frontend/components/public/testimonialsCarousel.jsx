// File: /frontend/components/public/TestimonialsCarousel.jsx
// Purpose: Production-grade rotating testimonial carousel with swipe and randomized start

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

/**
 * TestimonialsCarousel.jsx
 *
 * Displays rotating testimonials with auto-advance, swipe support,
 * dot navigation, and random start index. Optimized for trust and UX.
 */

export default function TestimonialsCarousel({ testimonials }) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.floor(Math.random() * testimonials.length)
  );

  const touchStartX = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[activeIndex];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        // swipe right
        setActiveIndex((prev) =>
          (prev - 1 + testimonials.length) % testimonials.length
        );
      } else {
        // swipe left
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center space-y-4">
        <p className="text-lg text-gray-800 italic">“{current.quote}”</p>
        <div className="flex flex-col items-center">
          {current.image && (
            <img
              src={current.image}
              alt={`${current.name}'s photo`}
              className="w-14 h-14 rounded-full object-cover mt-2"
            />
          )}
          <p className="font-semibold">{current.name}</p>
          <p className="text-sm text-gray-500">{current.location}</p>
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            aria-label={`Switch to testimonial ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === activeIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

TestimonialsCarousel.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      quote: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      image: PropTypes.string,
    })
  ).isRequired,
};
