import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuth();

    const navLinks = [
        { name: "Home", path: "/" },
        ...(isAuthenticated
            ? [{ name: "Spam History", path: "/history" }]
            : []),
        { name: "Contact", path: "/", hash: "contact" },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHome = location.pathname === "/";

    const handleLinkClick = (e, link) => {
        if (link.hash && isHome) {
            e.preventDefault();
            const element = document.getElementById(link.hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrolledStyle = isScrolled || !isHome;

    return (
        <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${scrolledStyle
            ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
            : "bg-transparent py-4 md:py-6"
            }`}>

            <Link to="/" className="flex items-center gap-2">
                <img
                    src="../logo.png"
                    alt="Logo"
                    className={`h-8 md:h-10 cursor-pointer transition-all duration-300 ${scrolledStyle ? "invert" : ""
                        }`}
                />
                <span
                    className={`text-sm md:text-lg font-semibold tracking-wide transition-all duration-300 ${scrolledStyle ? "text-black" : "text-white/90"
                        }`}
                >
                    DATADEFENDERS
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.hash ? `${link.path}#${link.hash}` : link.path}
                        onClick={(e) => handleLinkClick(e, link)}
                        className={`group flex flex-col gap-0.5 cursor-pointer ${scrolledStyle ? "text-gray-700" : "text-white"
                            }`}
                    >
                        {link.name}
                        <div
                            className={`${scrolledStyle ? "bg-gray-700" : "bg-white"
                                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
                        />
                    </Link>
                ))}
            </div>

            <div className="hidden md:flex items-center gap-3 ml-auto">
                {isAuthenticated ? (
                    <>
                        <span className={`text-sm ${scrolledStyle ? "text-gray-600" : "text-white/80"}`}>
                            {user?.username}
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrolledStyle
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                : "bg-white/10 hover:bg-white/20 text-white"
                                }`}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrolledStyle
                            ? "bg-gray-900 hover:bg-black text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        Login
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-3 md:hidden ml-auto">
                <svg
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`h-6 w-6 cursor-pointer ${scrolledStyle ? "invert" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
            </div>

            <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <button
                    className="absolute top-4 right-4"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.hash ? `${link.path}#${link.hash}` : link.path}
                        onClick={(e) => {
                            handleLinkClick(e, link);
                            setIsMenuOpen(false);
                        }}
                    >
                        {link.name}
                    </Link>
                ))}

                {isAuthenticated ? (
                    <button
                        onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                            navigate("/");
                        }}
                    >
                        Logout ({user?.username})
                    </button>
                ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};
