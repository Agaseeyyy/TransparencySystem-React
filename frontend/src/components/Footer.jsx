import React from "react";

const Footer = () => {
  return (
    <footer className=" bg-white rounded-lg shadow-sm dark:bg-gray-900 ml-64 max-lg:ml-0">
      <div className="w-full max-w-screen-xl p-4 py-8 mx-auto">
        <div className="flex items-center justify-between max-md:flex-col md:items-center">
          {/* Logo and Institution Name */}
          <a
            href="https://cspc.edu.ph/"
            className="flex items-center space-x-3 rtl:space-x-reverse md:mb-4"
          >
            <img
              src="https://campusconnect.cspc.edu.ph/src/img/cspc.png"
              className="h-8"
              alt="CSPC Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Camarines Sur Polytechnic Colleges
            </span>
          </a>

          {/* Footer Links */}
          <ul className="flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline me-6 md:me-4">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-6 md:me-4">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-6 md:me-4">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-200 dark:border-gray-700" />

        {/* Copyright Notice */}
        <span className="block text-sm text-center text-gray-500 dark:text-gray-400">
          © 2025{" "}
          <a href="https://cspc.edu.ph/" className="hover:underline">
            CSPC™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;