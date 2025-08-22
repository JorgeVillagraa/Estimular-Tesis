
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Testimonials.css';

const data = [
  { 
    quote: '“Hemos visto un progreso increíble en nuestro hijo desde que comenzó la terapia.”', 
    name: 'Familia Pérez',
    image: '/images/testimonial-mom.jpg' // <-- poné aquí tu imagen real
  },
];

export default function Testimonials() {
  return (
    <section id='testimonials' className="testimonials-section">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={40}
        className="testimonials-swiper"
      >
        {data.map((testimon, idx) => (
          <SwiperSlide key={idx} className="testimonial-slide">
            <div className="testimonial-content">
              <blockquote className="testimonial-quote">
                {testimon.quote}
              </blockquote>
              {testimon.image && (
                <div className="testimonial-image">
                  <img src={testimon.image} alt={testimon.name} />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
