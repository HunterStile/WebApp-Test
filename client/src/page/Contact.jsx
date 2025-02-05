import React from 'react';
import Header from '../components/Header';
import contactus from '../assets/images/contactus.png';

const ContactForm = () => {
  return (
    <div className="App min-h-screen bg-white dark:bg-dark-bg text-black dark:text-dark-text transition-colors duration-300">
        <Header />
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-7xl bg-white text-gray-900 p-8 rounded-lg flex gap-x-12">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
          <p className="mb-6">We are here for you! How can we help?</p>

          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                rows={5}
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-black text-white font-medium rounded-md px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <img
            src={contactus}
            alt="Contact form illustration"
            className="max-w-full"
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default ContactForm;