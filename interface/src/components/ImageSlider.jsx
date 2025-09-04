import React, { useState } from 'react';

const images = [
  'src/img/1.png',
  'src/img/2.png',
  'src/img/3.png',
  'src/img/4.png',
  'src/img/5.png',
  'src/img/6.png',
  'src/img/7.png',
];

const descriptions = [
  '1. 3D Model based on DH Parameters',
  '2. 3D CAD Model of KUKA KR5',
  '3. Graph plots to view kinematic and dynamic analyses results',
  '4. Inverse Kinematics of KUKA KR5',
  '5. Joint-level jogging in Virtual Robot Module',
  '6. Cartesian Motion in Virtual Robot Module',
  '7. Integration of Virtual Robot Module (VRM)  and MATLAB',
];

function ImageSlider() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? images.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === images.length - 1 ? 0 : current + 1);
  };

  return (
    <div className="flex flex-col items-center my-6">
      <div className="relative w-full max-w-2xl">
        <img
          src={images[current]}
          alt={`Slide ${current + 1}`}
          className="w-full h-[32rem] object-contain rounded shadow"
        />
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded-l"
          onClick={prevSlide}
        >
          &#8592;
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded-r"
          onClick={nextSlide}
        >
          &#8594;
        </button>
      </div>
      <div className="mt-4 text-lg font-semibold text-center max-w-2xl">
        {descriptions[current]}
      </div>
      <div className="flex mt-2 space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;
