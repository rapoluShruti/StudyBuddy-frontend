import { useNavigate } from "react-router-dom";
import useAuth from "../context/AuthContext/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ get user and logout

  const handleTryNow = () => {
    navigate("/login");
  };

  const handleAuthToggle = () => {
    if (user) {
      logout(); // ✅ real logout
    } else {
      navigate("/login"); // ✅ go to login
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 text-center py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Your Personalized Study Journey <br />
          <span className="text-blue-500">Starts Here</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Get a customized study roadmap with daily goals, curated resources,
          practice quizzes, <br />
          and motivational milestones tailored to your learning style.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleTryNow}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
          >
            Try Now
          </button>

          <button
            onClick={handleAuthToggle}
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-100 transition"
          >
            {user ? "Logout" : "Login"} {/* ✅ dynamic button */}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
