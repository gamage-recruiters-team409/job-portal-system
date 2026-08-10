import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

// Reusable contact information row component
function ContactInfoItem({ icon: Icon, label, value }) {
  return (
    <div
      className="
        flex items-start gap-4
        py-4
        px-2
        rounded-xl
        border-b border-slate-200
        transition-all
        duration-300
        hover:bg-blue-50
        last:border-b-0
      "
    >
      {/* Contact icon */}
      <div
        className="
          w-10 h-10
          rounded-xl
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          shrink-0
          transition-transform
          duration-300
          hover:scale-105
        "
      >
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Support email',
    value: 'Contact details will be updated soon.',
  },
  {
    icon: Phone,
    label: 'Contact number',
    value: 'Contact details will be updated soon.',
  },
  {
    icon: MapPin,
    label: 'Company address',
    value: 'Panadura, Sri Lanka ',
  },
];

function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <main
        className="
          max-w-[1280px]
          mx-auto
          px-4 sm:px-6 lg:px-10
          py-10 sm:py-14
        "
      >
        {/* Page heading */}
        <div className="text-center mb-10">
          <h1
            className="
              text-3xl sm:text-4xl
              font-bold
              text-slate-900
            "
          >
            Contact information
          </h1>

          <div
            className="
              w-14
              h-[3px]
              bg-blue-600
              rounded
              mx-auto
              mt-3
            "
          />
        </div>

        {/* Contact information and location section */}
        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          "
        >
          {/* Contact details card */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              p-6 sm:p-8
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
              hover:border-blue-300
            "
          >
            {CONTACT_DETAILS.map((item) => (
              <ContactInfoItem key={item.label} {...item} />
            ))}
          </div>

          {/* Location card */}
          <div
            className="
              bg-blue-50
              border border-blue-200
              rounded-2xl
              min-h-[300px]
              flex
              items-center
              justify-center
              relative
              overflow-hidden
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
              hover:border-blue-300
            "
          >
            {/* Decorative map grid */}
            <div
              className="
                absolute
                inset-0
                opacity-40
                bg-[linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)]
                bg-[size:32px_32px]
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                items-center
                gap-3
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-blue-600
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-md
                  transition-transform
                  duration-300
                  hover:scale-110
                "
              >
                <MapPin size={26} />
              </div>

              <div
                className="
                  bg-white
                  border border-slate-200
                  rounded-xl
                  px-5 py-2
                  text-sm
                  font-medium
                  text-slate-900
                  transition-shadow
                  duration-300
                  hover:shadow-md
                "
              >
                Gamage Recruiters, Panadura
              </div>
            </div>
          </div>
        </section>

        {/* Navigation to support form */}
        <div className="text-center mt-8">
          <Link
            to="/support"
            className="
                  inline-flex
                  items-center
                  gap-2 
                  bg-blue-600
                 hover:bg-blue-700
                 text-white
                 px-6
                  py-3
                 rounded-xl
                 font-semibold
                 transition-all
                 duration-300
                 hover:-translate-y-1
                 hover:shadow-lg
       "
          >
            Go to Contact Form
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
