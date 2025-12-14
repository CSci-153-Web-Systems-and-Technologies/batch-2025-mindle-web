"use client";

import React from 'react';
import Link from 'next/link';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="text-center bg-black/20 backdrop-blur-sm pt-8 pb-4 px-4">
      
      <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Column 1: Brand & Socials */}
        <div className="space-y-4 text-center">
          <h3 className="text-xl font-bold text-white relative inline-block">
            Mindle
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-cyan-400"></span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Where minds meet to learn across the universe of knowledge.
          </p>
          <div className="flex gap-4 pt-2 justify-center">
            <Link href="#" className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition group">
              <SiFacebook className="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link href="#" className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition group">
              <SiX className="w-5 h-5 text-white group-hover:text-gray-400 transition-colors" />
            </Link>
            <Link href="#" className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition group">
              <SiInstagram className="w-5 h-5 text-white group-hover:text-pink-500 transition-colors" />
            </Link>
            <Link href="#" className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition group">
              <SiLinkedin className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Column 2: Explore */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
            Explore
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-cyan-400"></span>
          </h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/marketing/find-tutors" className="hover:text-cyan-400 transition">Find Tutors</Link></li>
            <li><Link href="/marketing/study-groups" className="hover:text-cyan-400 transition">Study Groups</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
            Company
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-cyan-400"></span>
          </h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/market/about" className="hover:text-cyan-400 transition">About Us</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition">Terms of Service</Link></li>
          </ul>
        </div>

      </div>
      
      {/* Footer Bottom */}
      <div className="text-center text-gray-500 text-xs pt-8 border-t border-white/5">
        © 2025 Mindle. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;