// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineShieldCheck, 
  HiOutlineCreditCard, 
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowRight
} from "react-icons/hi2";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <HiOutlineHome className="text-blue-600 w-8 h-8" />
          <span className="text-2xl font-black text-gray-900 tracking-tighter">CampusStay</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold transition">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-200"
          >
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>Now live in 10+ Universities</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
            Housing for <br />
            <span className="text-blue-600">Smart Students.</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
            Stop the manual search. Book verified hostels, track your rent, and manage maintenance requests—all from your Kali Linux or mobile browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/register" 
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200"
            >
              <span>Start Searching</span>
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center justify-center bg-white border-2 border-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition"
            >
              List Property
            </Link>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-4 shadow-2xl">
            <div className="bg-gray-50 rounded-[2rem] h-[450px] flex items-center justify-center border border-dashed border-gray-200">
               <HiOutlineHome className="w-32 h-32 text-blue-100" />
               <span className="absolute bottom-12 bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-50 flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <HiOutlineShieldCheck className="text-green-600 w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                    <p className="text-sm font-black text-gray-900">Verified Listing</p>
                  </div>
               </span>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Bar */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Feature icon={<HiOutlineShieldCheck />} text="Verified Landlords" />
          <Feature icon={<HiOutlineCreditCard />} text="Secure Payments" />
          <Feature icon={<HiOutlineWrenchScrewdriver />} text="Maintenance Portal" />
          <Feature icon={<HiOutlineHome />} text="100% Student Focused" />
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center space-x-3 text-gray-500 hover:text-blue-600 transition cursor-default">
    <span className="text-2xl">{icon}</span>
    <span className="font-bold tracking-tight">{text}</span>
  </div>
);

export default LandingPage;