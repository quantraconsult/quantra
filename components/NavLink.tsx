import React from 'react';

interface NavLinkProps {
    title: string;
    href: string;
    icon: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ title, href, icon }) => {
    return (
        <a
            href={href}
            className="group bg-zinc-800 border border-zinc-500 text-white font-bold text-lg hover:bg-zinc-700 hover:border-zinc-300 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center space-x-3 w-full py-4 px-6"
        >
            {icon}
            <span>{title}</span>
        </a>
    );
};

export default NavLink;
