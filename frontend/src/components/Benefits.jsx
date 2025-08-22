const benefits = [
  { icon: '🎯', text: 'Atención personalizada' },
  { icon: '📆', text: 'Planes flexibles' },
  { icon: '📈', text: 'Resultados medibles' },
];

export default function Benefits() {
  return (
    <section className="py-16 bg-lightPurple text-white">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {benefits.map((b,i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-5xl mb-4">{b.icon}</div>
            <p className="text-lg font-medium">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
