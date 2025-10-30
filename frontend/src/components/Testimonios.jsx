
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Testimonios.css';


import testimonio1 from '../assets/testimonio1.jpg' ;
import testimonio2 from '../assets/testimonio2.jpg' ;
import testimonio3 from '../assets/testimonio3.jpg' ;


const data = [
  { 
    quote: '“Todos los avances en mis hijos son en gran medida gracias al aporte de este gran equipo que acompaña con amor compromiso y siempre buscando soluciones ante cada nueva situacion ”', 
    name: 'Erica Costilla',
    image: testimonio1
  },
  {
    quote: "Gracias equipo Estimular, por la dedicación, el compromiso, el cariño y la responsabilidad hacia mi hijo. Les agradezco, porque sus logros y evolución son notorios y significativos.",
    name: "Familia Rodríguez",
    image: testimonio2
  },
  {
    quote: '“El trabajo en equipo hace que los sueños se hagan realidad. No es magia, es compromiso y amor por los demás. ¡Los avances son increíbles! Muchas gracias de todo corazón.”',
    name: 'Familia 3',
    image: testimonio3
  },
];

export default function Testimonios() {
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
