import '../styles/Services.css';

export default function Services() {
  const items = [
    {
      title: 'Evaluaciones Diagnósticas',
      iconClass: 'service-icon blue',
      icon: (
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="12" fill="#0099E5"/>
          <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      desc: 'Pruebas completas para identificar necesidades específicas'
    },
    {
      title: 'Terapia Individual',
      iconClass: 'service-icon orange',
      icon: (
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="12" fill="#FF7F27"/>
          <circle cx="12" cy="10" r="3" fill="#fff"/>
          <rect x="9" y="14" width="6" height="4" rx="2" fill="#fff"/>
        </svg>
      ),
      desc: 'Tratamiento personalizado para cada niño o adolescente'
    },
    {
      title: 'Apoyo Familiar',
      iconClass: 'service-icon red',
      icon: (
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="12" fill="#E53935"/>
          <circle cx="8" cy="10" r="2" fill="#fff"/>
          <circle cx="16" cy="10" r="2" fill="#fff"/>
          <rect x="6" y="14" width="12" height="4" rx="2" fill="#fff"/>
        </svg>
      ),
      desc: 'Orientación y soporte para toda la familia'
    },
  ];

  return (
    <section id='services' className="services-section">
      <h2 className="services-title">Nuestros Servicios</h2>
      <div className="services-list">
        {items.map((item, idx) => (
          <div key={idx} className="service-item">
            <div className={item.iconClass}>{item.icon}</div>
            <h3 className="service-name">{item.title}</h3>
            <p className="service-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
