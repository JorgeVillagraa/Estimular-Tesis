
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';


import img1 from '../assets/imagen_prueba1.jpg' ;
import img2 from '../assets/imagen_prueba2.jpg' ;
import img3 from '../assets/imagen_prueba3.jpg' ;






import '../styles/Galeria.css';

export default function Gallery() {
  const images = [
    img1,
    img2,
    img3,
    img1
  ];

  return (
    <section id='gallery' className="gallery-section">
      <h2 className="gallery-title">Galería</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        className="gallery-swiper"
        slidesPerView={3}
        spaceBetween={24}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <div className="gallery-item">
              <img src={src} alt={`Slide ${idx+1}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
