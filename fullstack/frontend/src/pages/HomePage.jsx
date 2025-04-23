import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';
import Patients from '../components/home/Patients';
import Contact from '../components/home/Contact';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <Services />
        <About />
        <Patients />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;