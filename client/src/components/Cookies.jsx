// src/components/Cookies.js
import React from 'react';
import Header from '../components/Header';
const Cookies = () => {
  return (
    <div className="App min-h-screen bg-white dark:bg-dark-bg text-black dark:text-dark-text transition-colors duration-300">
    <Header />
    <div className="flex justify-center p-8">
      <div className="w-full max-w-6xl bg-white text-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold mb-4 text-center">Cookie Policy</h1>
        <p className="text-justify">This cookie policy explains how Fast Affiliation uses cookies and similar technologies on our website. Our use of cookies complies with current regulations, including Article 22.2 of Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE).</p>
        
        <h2 className="text-2xl font-semibold mt-6">1. What are cookies?</h2>
        <p className="text-justify">Cookies are small data files that are downloaded to your device (computer, tablet, smartphone, etc.) when you access a website. The information contained in these files is then sent back to our server each time your browser requests a page from the server. Cookies enable the website to recognize your device and save information about your visits and preferences.</p>
        
        <h2 className="text-2xl font-semibold mt-6">2. Types of Cookies Used by Fast Affiliation</h2>
        <ul className="ml-8 text-justify space-y-2 list-disc">
          <li><strong>First-party cookies:</strong> Sent from our site, managed directly by Fast Affiliation.</li>
          <li><strong>Third-party cookies:</strong> Managed by other entities, such as analytics or advertising services, including YouTube, Google Analytics, reCaptcha, Google Fonts, cdnjs, Bootstrap cdn.maxcdn, and Codejquery.</li>
          <li><strong>Session cookies:</strong> Temporary cookies deleted when you close your browser.</li>
          <li><strong>Persistent cookies:</strong> Stored on your device for a defined period, from minutes to years.</li>
          <li><strong>Technical cookies:</strong> Essential for site navigation and service usage.</li>
          <li><strong>Functionality cookies:</strong> Remember user preferences for a personalized experience.</li>
          <li><strong>Analytical and Performance Cookies:</strong> Collect anonymous statistics to improve site performance.</li>
          <li><strong>Advertising and behavioral advertising cookies:</strong> Manage advertising spaces and adapt ads to user interests.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">3. How We Use Cookies</h2>
        <ul className="ml-8 text-justify space-y-2 list-disc">
          <li>To improve services.</li>
          <li>To ensure proper site functionality.</li>
          <li>To personalize the user experience.</li>
          <li>To adapt the site to screen size and language.</li>
          <li>To pre-fill forms.</li>
          <li>To monitor site traffic.</li>
          <li>To track advertising campaigns.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">4. Examples of Cookies Used</h2>
        <ul className="ml-8 text-justify space-y-2 list-disc">
          <li><strong>php-session:</strong> A session cookie necessary for site navigation.</li>
          <li><strong>ga-session:</strong> Contains session, IP, user agent, last activity, and language.</li>
          <li>Cookies for language selection.</li>
          <li>Cookies for authenticated users, storing user ID, language, role, name, and username.</li>
          <li>Cookies for tracking campaigns, with a duration of 30 days.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">5. How to Manage Cookies</h2>
        <p className="text-justify">You can control and change your cookie settings through your browser settings:</p>
        <ul className="ml-8 text-justify space-y-2 list-disc">
          <li><strong>Internet Explorer:</strong> Tools {'>'} Internet Options {'>'} Privacy {'>'} Settings.</li>
          <li><strong>Firefox:</strong> Tools {'>'} Options {'>'} Privacy {'>'} Cookies.</li>
          <li><strong>Google Chrome:</strong> Settings {'>'} Privacy.</li>
          <li><strong>Safari:</strong> Preferences {'>'} Security.</li>
        </ul>
        
        <p className="text-justify">You can also enable private browsing to delete cookies at the end of each session:</p>
        <ul className="ml-8 text-justify space-y-2 list-disc">
          <li><strong>Internet Explorer 8+</strong>: InPrivate.</li>
          <li><strong>Firefox 3.5+</strong>: Private Browsing.</li>
          <li><strong>Google Chrome 10+</strong>: Incognito.</li>
          <li><strong>Safari 2+</strong>: Private Browsing.</li>
          <li><strong>Opera 10.5+</strong>: Private Browsing.</li>
        </ul>
      </div>
    </div>
  </div>

  );
};

export default Cookies;
