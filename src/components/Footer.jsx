import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Logo + Description */}
        <div>
          <h3 className="text-2xl font-bold text-blue-600 mb-2">StudyBuddy</h3>
          <p className="text-gray-500">
            Your personalized learning companion. Create, track, and achieve
            your study goals with ease.
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-gray-500">
            <li>
              <a href="#" className="hover:text-blue-600 transition">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600 transition">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600 transition">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600 transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-3">
            Follow Us
          </h4>
          <div className="flex justify-center md:justify-start gap-4 text-gray-500 text-xl">
            <a href="#">
              <FaFacebookF className="hover:text-blue-600 transition" />
            </a>
            <a href="#">
              <FaTwitter className="hover:text-blue-400 transition" />
            </a>
            <a href="#">
              <FaLinkedinIn className="hover:text-blue-700 transition" />
            </a>
            <a href="#">
              <FaGithub className="hover:text-gray-800 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 mt-6 py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
