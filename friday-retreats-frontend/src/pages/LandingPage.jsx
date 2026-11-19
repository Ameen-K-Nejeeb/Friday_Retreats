import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const destinations = [
    {
        name: 'Munnar',
        subtitle: 'Tea Estates & Cloud Forests',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Varkala',
        subtitle: 'Cliffs & Coastal Sanctuaries',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Wayanad',
        subtitle: 'Rainforest Retreats',
        image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Kochi',
        subtitle: 'Colonial Heritage',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    },
];

const LandingPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, role } = useSelector((state) => state.auth);

    const [destination, setDestination] = useState('');
    const [dates, setDates] = useState('');
    const [guests, setGuests] = useState('2 Adults, 0 Children');

    const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
};

    const handleSearch = (e) => {
        e.preventDefault();
        // Hook this up to your properties search route later
        console.log({ destination, dates, guests });
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link to="/" className="text-xl font-bold tracking-tight text-[#5a1c1d]">
                        Friday Retreats
                    </Link>

                    {/* Center Nav Links */}
                    <nav className="hidden md:flex items-center space-x-7 text-[13px] font-medium text-gray-600">
                        <Link
                            to="/"
                            className="text-[#5a1c1d] font-semibold border-b-2 border-[#5a1c1d] py-1"
                        >
                            Explore
                        </Link>
                        <a href="#destinations" className="hover:text-[#5a1c1d] transition">
                            Destinations
                        </a>
                        <a href="#packages" className="hover:text-[#5a1c1d] transition">
                            Packages
                        </a>
                        <a href="#hotels" className="hover:text-[#5a1c1d] transition">
                            Hotels
                        </a>
                        <a href="#fr-club" className="hover:text-[#5a1c1d] transition">
                            FR Club
                        </a>
                        <a href="#about" className="hover:text-[#5a1c1d] transition">
                            About
                        </a>
                        <a href="#contact" className="hover:text-[#5a1c1d] transition">
                            Contact
                        </a>
                    </nav>

                    {/* Top-Right Auth Controls */}
                    <div className="flex items-center space-x-4">
                        {token ? (
                            <>
                                {role === 'ADMIN' && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-[13px] font-medium text-gray-700 hover:text-[#5a1c1d] transition"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 text-[13px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] rounded transition cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-[13px] font-medium text-gray-700 hover:text-[#5a1c1d] transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 text-[13px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] rounded transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative w-full h-[540px] flex flex-col items-center justify-center px-4 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1920&q=80')",
                    }}
                />
                {/* Soft Top Darkening & Bottom Fade to White */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-white" />

                {/* Hero Copy */}
                <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-sm mb-4">
                        Heritage Modernist
                        <br />
                        Hospitality
                    </h1>
                    <p className="text-sm md:text-base text-white/95 font-normal drop-shadow-sm">
                        Discover curated sanctuaries blending storied architecture with quiet luxury.
                    </p>
                </div>

                {/* Floating Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="relative z-10 w-full max-w-4xl bg-white rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.12)] p-2 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-200"
                >
                    {/* Destination */}
                    <div className="flex items-center w-full md:w-1/3 px-5 py-2">
                        <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="w-full text-left">
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-800">
                                Destination
                            </label>
                            <input
                                type="text"
                                placeholder="Where to?"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center w-full md:w-1/3 px-5 py-2">
                        <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="w-full text-left">
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-800">
                                Dates
                            </label>
                            <input
                                type="text"
                                placeholder="Check in - Check out"
                                value={dates}
                                onChange={(e) => setDates(e.target.value)}
                                className="w-full text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center justify-between w-full md:w-1/3 pl-5 pr-2 py-2">
                        <div className="flex items-center w-full">
                            <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="w-full text-left">
                                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-800">
                                    Guests
                                </label>
                                <input
                                    type="text"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="w-full text-[13px] text-gray-700 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            aria-label="Search"
                            className="w-11 h-11 rounded-full bg-[#5a1c1d] hover:bg-[#451415] text-white flex items-center justify-center shrink-0 transition cursor-pointer ml-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </section>

            {/* Featured Destinations */}
            <section id="destinations" className="max-w-7xl w-full mx-auto px-6 py-16">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[#4a1516] tracking-tight mb-1">
                            Featured Destinations
                        </h2>
                        <p className="text-[13px] text-gray-500">
                            Curated locales offering exceptional heritage experiences.
                        </p>
                    </div>
                    <a
                        href="#all-destinations"
                        className="text-[13px] font-semibold text-[#5a1c1d] hover:underline inline-flex items-center"
                    >
                        View all <span className="ml-1">&rarr;</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((item) => (
                        <div
                            key={item.name}
                            className="group relative h-[320px] rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                <h3 className="text-lg font-bold leading-snug">{item.name}</h3>
                                <p className="text-[12px] text-white/85">{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-[#04363e] text-white/80 py-14 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <h4 className="text-lg font-semibold text-[#79b4bc] mb-3">Friday Retreats</h4>
                        <p className="text-[12px] leading-relaxed text-white/65 max-w-xs mb-3">
                            Elevating heritage hospitality through quiet luxury and modernist design.
                        </p>
                        <p className="text-[11px] text-white/50">
                            &copy; {new Date().getFullYear()} Friday Retreats. Heritage Modernist Hospitality.
                        </p>
                    </div>

                    <div>
                        <h5 className="text-[11px] font-bold tracking-widest uppercase text-[#79b4bc] mb-4">
                            Legal
                        </h5>
                        <ul className="space-y-2.5 text-[12px] text-white/65">
                            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-[11px] font-bold tracking-widest uppercase text-[#79b4bc] mb-4">
                            Company
                        </h5>
                        <ul className="space-y-2.5 text-[12px] text-white/65">
                            <li><a href="#" className="hover:text-white transition">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Careers</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;