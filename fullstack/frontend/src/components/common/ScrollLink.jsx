import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ScrollLink = ({ to, children, className, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    
    // If we're already on the home page
    if (location.pathname === '/') {
      // Extract the ID from the URL (e.g., "/#about" -> "about")
      const id = to.replace('/#', '');
      const element = document.getElementById(id);
      
      if (element) {
        // Scroll to the element
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to the home page with the hash
      navigate(to);
    }
    
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};

export default ScrollLink;
