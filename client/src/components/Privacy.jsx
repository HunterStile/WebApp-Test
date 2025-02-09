// src/components/Privacy.js
import React from 'react';
import Header from '../components/Header';

const Privacy = () => {
  return (
    <div className="App min-h-screen bg-white dark:bg-dark-bg text-black dark:text-dark-text transition-colors duration-300">
      <Header />
      <div className="flex justify-center p-8">
        <div className="w-full max-w-6xl bg-white text-gray-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-5xl font-bold mb-4 text-center">Privacy Policy</h1>
          <p className="text-justify">Your privacy is important to us. This Privacy Policy describes how we collect, use, and protect your personal data.</p>

          <h2 className="text-2xl font-semibold mt-6">1. Data Controller Identification</h2>
          <p className="text-justify">The data controller is Fast Affiliation and can be contacted via email at [Email] for any data protection inquiries.</p>

          <h2 className="text-2xl font-semibold mt-6">2. Purposes of Data Processing</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Providing platform services.</li>
            <li>Managing user registrations.</li>
            <li>Processing payments.</li>
            <li>Sending service or marketing communications (with consent).</li>
            <li>Improving services and user experience.</li>
            <li>Complying with legal obligations and preventing fraud.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">3. Types of Data Collected</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Login and registration data (username, password).</li>
            <li>Full name.</li>
            <li>Email and postal addresses.</li>
            <li>IP addresses.</li>
            <li>Bank and payment details.</li>
            <li>Communication data (emails, internal messages).</li>
          </ul>
          <p className="text-justify">We may collect data through cookies, as described in our Cookie Policy.</p>

          <h2 className="text-2xl font-semibold mt-6">4. Legal Basis for Processing</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Contract execution.</li>
            <li>User consent.</li>
            <li>Legal obligations.</li>
            <li>Legitimate interests of the controller.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">5. Data Recipients</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Service providers (hosting, email, payments).</li>
            <li>Professional advisors.</li>
            <li>Public or judicial authorities (when required by law).</li>
            <li>Affiliates or business partners (with consent).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">6. International Data Transfers</h2>
          <p className="text-justify">If we transfer data outside the European Economic Area (EEA), we ensure protection through standard contractual clauses or other adequate measures.</p>

          <h2 className="text-2xl font-semibold mt-6">7. Data Retention Period</h2>
          <p className="text-justify">We retain data as long as necessary to provide services or until a deletion request is made. Some data may be kept for legal or legitimate interests.</p>

          <h2 className="text-2xl font-semibold mt-6">8. Data Subject Rights</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Right to access data.</li>
            <li>Right to rectify inaccurate data.</li>
            <li>Right to request data deletion.</li>
            <li>Right to restrict data processing.</li>
            <li>Right to object to data processing.</li>
            <li>Right to data portability.</li>
            <li>Right to withdraw consent at any time.</li>
          </ul>
          <p className="text-justify">You can exercise your rights by contacting us at [Email] or via postal mail at [Address].</p>

          <h2 className="text-2xl font-semibold mt-6">9. Data Security</h2>
          <p className="text-justify">We implement adequate security measures to protect data, including secure servers and contracts with reliable providers.</p>

          <h2 className="text-2xl font-semibold mt-6">10. Cookie Policy</h2>
          <p className="text-justify">For information about cookies, please refer to our Cookie Policy.</p>

          <h2 className="text-2xl font-semibold mt-6">11. Privacy Policy Updates</h2>
          <p className="text-justify">This policy may be updated. Users will be informed of any changes.</p>

          <h2 className="text-2xl font-semibold mt-6">12. Contact Information</h2>
          <p className="text-justify">For any privacy-related inquiries, please contact us at [Email].</p>
        </div>
      </div>
    </div>

  );
};

export default Privacy;
