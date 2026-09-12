import { Link } from 'react-router-dom';
import { Clock, MapPin, Shirt, Baby, Car, Heart, ArrowRight } from 'lucide-react';

const items = [
  {
    icon: Clock,
    title: 'When We Gather',
    body: (
      <>
        <p className="mb-2"><strong>Sunday</strong></p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 mb-3">
          <li>Youth Service — 6:00 AM to 8:00 AM</li>
          <li>Main Service — 8:00 AM to 1:00 PM</li>
          <li>Evening Service — 3:00 PM to 5:00 PM</li>
        </ul>
        <p className="mb-2"><strong>Monday – Friday</strong></p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Morning Glory — 4:00 AM to 6:00 AM</li>
          <li>Grace Hour — 12:00 Noon to 1:45 PM</li>
        </ul>
      </>
    ),
  },
  {
    icon: MapPin,
    title: 'Where to Find Us',
    body: (
      <>
        <p className="text-slate-600 mb-3">
          FPFK Kitengela Township<br />
          Philadelphia Worship Centre<br />
          Kitengela, Kajiado County
        </p>
        <a
          href="https://maps.app.goo.gl/6A6MPxf21ByV1KWU9"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline underline-offset-4"
        >
          Get directions <ArrowRight className="w-4 h-4" />
        </a>
      </>
    ),
  },
  {
    icon: Shirt,
    title: 'What to Wear',
    body: (
      <p className="text-slate-600">
        Come as you are. Most people dress smart-casual. There is no strict dress code —
        the important thing is that you feel welcome.
      </p>
    ),
  },
  {
    icon: Baby,
    title: 'Kids & Families',
    body: (
      <p className="text-slate-600">
        Families are welcome in every service. Ask a usher when you arrive about children&apos;s
        ministry or where to sit with little ones — we&apos;ll help you settle in.
      </p>
    ),
  },
  {
    icon: Car,
    title: 'Parking & Arrival',
    body: (
      <p className="text-slate-600">
        Arrive a few minutes early so you can park and find a seat comfortably. Our ushers
        will greet you at the entrance and point you in the right direction.
      </p>
    ),
  },
  {
    icon: Heart,
    title: 'What to Expect',
    body: (
      <p className="text-slate-600">
        You can expect warm worship, the Word of God, and a friendly church family.
        You won&apos;t be singled out or pressured. Stay for the whole service or leave when
        you need to — we&apos;re glad you came either way.
      </p>
    ),
  },
];

export default function PlanYourVisit() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-indigo-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Plan Your Visit</h1>
          <p className="text-lg text-indigo-200">
            We&apos;d love to meet you. Here&apos;s everything you need to know for your first Sunday
            with us.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
              <div className="text-sm leading-relaxed">{body}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center rounded-2xl bg-indigo-950 text-white p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to join us?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            Have a question before you come? Send us a message — we&apos;re happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/connect"
              className="inline-block bg-white text-indigo-950 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition"
            >
              Contact Us
            </Link>
            <a
              href="https://maps.app.goo.gl/6A6MPxf21ByV1KWU9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/70 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}