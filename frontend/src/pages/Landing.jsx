


import Hero from '../components/Hero';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';  
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div>
        <Navbar/>
        <Hero />
        <Services />
        <Testimonials />
        <Gallery />
        <Footer />
    </div>
  );
}
