import { items } from "../constants/items";
import { getIcon } from "../constants/icons";
import "../styles/Services.css";

export default function Services() {
  return (
    <section id="services" className="services-section">
      <h2 className="services-title">Nuestros Servicios</h2>
      <div className="services-list">
        {items.map((item, idx) => (
          <div key={idx} className="service-item">
            <div className={item.iconClass}>{getIcon(item.iconType)}</div>
            <h3 className="service-name">{item.title}</h3>
            <p className="service-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
