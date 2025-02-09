// src/components/Terms.js
import React from 'react';
import Header from '../components/Header';

const Terms = () => {
  return (
    <div className="App min-h-screen bg-white dark:bg-dark-bg text-black dark:text-dark-text transition-colors duration-300">
      <Header />
      <div className="flex justify-center p-8">
        <div className="w-full max-w-6xl bg-white text-gray-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-5xl font-bold mb-4 text-center">Terms and Conditions</h1>
          <p className="text-justify">Welcome to Fast Affiliation, the platform that allows you to access affiliate services for online gambling. By using this site, you agree to the following Terms and Conditions. If you do not agree, please refrain from using our service.</p>

          <h2 className="text-2xl font-semibold mt-6">1. Registration and Requirements</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>To become an affiliate, you must register on the platform by filling out an online form and accepting these terms and conditions.</li>
            <li>Affiliates must be at least 18 years old. If an affiliate is a minor, a parent or legal guardian must register on their behalf.</li>
            <li>The platform reserves the right to accept or reject any affiliation request.</li>
            <li>Affiliates are responsible for ensuring that they have the legal right to promote operators.</li>
            <li>Some platforms may require identity verification, possibly via video call.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 ">2. Platform Obligations</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>The platform is committed to ensuring the proper functioning of its services and providing access to campaign statistics.</li>
            <li>The platform must regularly inform affiliates about new campaigns and provide necessary marketing tools.</li>
            <li>The platform is responsible for recording and storing user information.</li>
            <li>The platform acts as a payment channel between operators and affiliates.</li>
            <li>The platform provides detailed information on commissions due to affiliates.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">3. Affiliate Obligations</h2>
          <ul className="ml-8 text-justify space-y-2 list-disc">
            <li>Affiliates must cooperate to ensure the correct display and maintenance of the provided links.</li>
            <li>They must use tracking links to ensure proper monitoring of user actions.</li>
            <li>Any fraudulent action or attempt to artificially alter commissions is strictly prohibited.</li>
            <li>Affiliates must not change the form or position of the links provided by the platform.</li>
            <li>They must not promote content to people residing in countries where the operator is not authorized.</li>
            <li>Affiliates are only authorized to promote approved websites for promotional activities.</li>
            <li>Affiliates must comply with the terms and conditions of each campaign.</li>
            <li>They must manage their accounts through their legal representatives.</li>
            <li>Affiliates must only use the unique URLs provided by the platform.</li>
            <li>It is forbidden to use direct links to the operators' websites.</li>
            <li>Affiliates must not create websites or domains with the platform's name.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Terms;
