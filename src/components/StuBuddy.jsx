import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const StudyBuddy = () => {
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState("both");
  const [notes, setNotes] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedTopic, setSearchedTopic] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // User state for authentication and usage tracking
  const [user, setUser] = useState(null);
  const [userRequestsCount, setUserRequestsCount] = useState(0);

  // State for selected text pop-up and explanation modal
  const [selectedText, setSelectedText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const notesRef = useRef(null);
  const popupRef = useRef(null);

  const [buddyExplanation, setBuddyExplanation] = useState("");
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);

  // Dummy Payment Modal State
  const [showDummyPaymentModal, setShowDummyPaymentModal] = useState(false);

  // Define limits
  const ANONYMOUS_FREE_LIMIT = 3;
  const LOGGED_IN_FREE_LIMIT = 2;

  // Determine the effective DAILY_FREE_LIMIT based on user status
  const effectiveDailyLimit = user?.isPremium
    ? Infinity
    : user
    ? LOGGED_IN_FREE_LIMIT
    : ANONYMOUS_FREE_LIMIT;

  // Determine if the user has reached their limit
  const hasReachedLimit = userRequestsCount >= effectiveDailyLimit;

  // Update user usage and persist to localStorage
  const updateUsageAndUser = (updatedUser) => {
    updatedUser.lastRequestDate = new Date().toISOString();
    setUser(updatedUser);
    setUserRequestsCount(updatedUser.dailyRequestsCount || 0);

    if (updatedUser.isAnonymous) {
      localStorage.setItem(
        `anonUser_${updatedUser._id}`,
        JSON.stringify(updatedUser)
      );
      localStorage.setItem("anonymousUserId", updatedUser._id);
    } else {
      const userToStore = { ...updatedUser };
      delete userToStore.password;
      localStorage.setItem("user", JSON.stringify(userToStore));
    }
  };

  useEffect(() => {
    // Attempt to load logged-in user first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const lastRequestDate = new Date(parsedUser.lastRequestDate);
      const today = new Date();

      if (
        !parsedUser.isPremium &&
        lastRequestDate.toDateString() !== today.toDateString()
      ) {
        parsedUser.dailyRequestsCount = 0;
        parsedUser.lastRequestDate = today.toISOString();
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }
      setUser(parsedUser);
      setUserRequestsCount(parsedUser.dailyRequestsCount || 0);
    } else {
      // If no logged-in user, try to load anonymous user
      // const anonymousUserId = localStorage.getItem("anonymousUserId");
      // if (anonymousUserId) {
      //   const storedAnonymousData = localStorage.getItem(
      //     `anonUser_${anonymousUserId}`
      //   );
      //   if (storedAnonymousData) {
      //     const parsedAnonymousData = JSON.parse(storedAnonymousData);
      //     const lastAnonymousRequestDate = new Date(
      //       parsedAnonymousData.lastRequestDate
      //     );
      //     const today = new Date();

      //     if (
      //       lastAnonymousRequestDate.toDateString() !== today.toDateString()
      //     ) {
      //       parsedAnonymousData.dailyRequestsCount = 0;
      //       parsedAnonymousData.lastRequestDate = today.toISOString();
      //       localStorage.setItem(
      //         `anonUser_${anonymousUserId}`,
      //         JSON.stringify(parsedAnonymousData)
      //       );
      //     }
      //     setUser({
      //       _id: anonymousUserId,
      //       isAnonymous: true,
      //       isPremium: false,
      //       dailyRequestsCount: parsedAnonymousData.dailyRequestsCount || 0,
      //       lastRequestDate: parsedAnonymousData.lastRequestDate,
      //     });
        //   setUserRequestsCount(parsedAnonymousData.dailyRequestsCount || 0);
        // } else {
        //   setUser({
        //     _id: anonymousUserId,
        //     isAnonymous: true,
        //     isPremium: false,
        //     dailyRequestsCount: 0,
        //     lastRequestDate: new Date().toISOString(),
        //   });
        //   setUserRequestsCount(0);
        // }
      } else {
        setUser(null);
        setUserRequestsCount(0);
      }
    }

    // Load last study output from localStorage
    const lastStudyData = localStorage.getItem("lastStudyOutput");
    if (lastStudyData) {
      const { notes, videos, searchedTopic } = JSON.parse(lastStudyData);
      setNotes(notes || "");
      setVideos(videos || []);
      setSearchedTopic(searchedTopic || "");
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
      setSelectedText("");
      window.getSelection().removeAllRanges();
    }
  };

  const handleTextSelection = (e) => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (
        text.length > 0 &&
        notesRef.current &&
        notesRef.current.contains(selection.anchorNode)
      ) {
        setSelectedText(text);
        setShowPopup(true);

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPopupPosition({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - 40,
        });
      } else {
        setShowPopup(false);
        setSelectedText("");
      }
    }, 100);
  };

  const commonFetchOptions = (method, body) => {
    const headers = { "Content-Type": "application/json" };
    if (user && user._id) {
      headers["X-User-Id"] = user._id;
    }
    return {
      method,
      headers,
      body: JSON.stringify(body),
    };
  };

  // Centralized function to check limits and show modal
  // const checkAndHandleLimit = () => {
  //   if (user && user.isPremium) {
  //     return false;
  //   }
  //   if (!user && userRequestsCount >= ANONYMOUS_FREE_LIMIT) {
  //     setShowLoginModal(true);
  //     setError("You've used your free search. Please log in to continue!");
  //     return true;
  //   }
  //   if (user && user.isAnonymous && userRequestsCount >= ANONYMOUS_FREE_LIMIT) {
  //     setShowLoginModal(true);
  //     setError(
  //       "You've used your free anonymous search. Please log in to continue!"
  //     );
  //     return true;
  //   }
  //   if (user && !user.isPremium && userRequestsCount >= LOGGED_IN_FREE_LIMIT) {
  //     setShowDummyPaymentModal(true);
  //     setError(
  //       `You've used your ${LOGGED_IN_FREE_LIMIT} free requests for today. Please upgrade to continue!`
  //     );
  //     return true;
  //   }
  //   return false;
  // };
//check
  const checkAndHandleLimit = () => {
  // Require login for all users
  if (!user) {
    setShowLoginModal(true);
    setError("Please log in to continue!");
    return true;
  }
  // Premium users have no limit
  if (user.isPremium) {
    return false;
  }
  // Free user daily limit
  if (userRequestsCount >= LOGGED_IN_FREE_LIMIT) {
    setShowDummyPaymentModal(true);
    setError(
      `You've used your ${LOGGED_IN_FREE_LIMIT} free requests for today. Please upgrade to continue!`
    );
    return true;
  }
  return false;
};
  // const handleSubmit = async (e) => {
  //   if (e) e.preventDefault();

  //   if (checkAndHandleLimit()) {
  //     return;
  //   }

  //   // Require login for all users except logged-in ones
  //   if (!user || user.isAnonymous) {
  //     setShowLoginModal(true);
  //     setError("Please log in to use StudyBuddy.");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");
  //   setNotes("");
  //   setVideos([]);
  //   setSearchedTopic(topic);
  //   setShowPopup(false);
  //   setShowExplanationModal(false);

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/study`,
  //       commonFetchOptions("POST", { topic, type: selectedType })
  //     );

  //     if (user && !user.isPremium) {
  //       const userToUpdate = {
  //         ...user,
  //         dailyRequestsCount: (user.dailyRequestsCount || 0) + 1,
  //       };
  //       updateUsageAndUser(userToUpdate);
  //     }

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       if (errorData.code === "LIMIT_EXCEEDED") {
  //         setError(errorData.error);
  //         setShowDummyPaymentModal(true);
  //         return;
  //       }
  //       throw new Error(errorData.error || `Status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     if (data.notes) setNotes(data.notes);
  //     if (data.videos) setVideos(data.videos);

  //     localStorage.setItem(
  //       "lastStudyOutput",
  //       JSON.stringify({
  //         notes: data.notes || "",
  //         videos: data.videos || [],
  //         searchedTopic: topic,
  //       })
  //     );
  //   } catch (err) {
  //     setError(`Failed to fetch: ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
  if (e) e.preventDefault();

  if (checkAndHandleLimit()) {
    return;
  }

  setLoading(true);
  setError("");
  setNotes("");
  setVideos([]);
  setSearchedTopic(topic);
  setShowPopup(false);
  setShowExplanationModal(false);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/study`,
      commonFetchOptions("POST", { topic, type: selectedType })
    );

    // For logged-in users (not premium)
    if (user && !user.isPremium) {
      const userToUpdate = {
        ...user,
        dailyRequestsCount: (user.dailyRequestsCount || 0) + 1,
      };
      updateUsageAndUser(userToUpdate);
    }

    // For anonymous (not logged in) users
    if (!user) {
      setUserRequestsCount((prev) => prev + 1);
      localStorage.setItem(
        "anonymousUserId",
        "anonymous"
      );
      localStorage.setItem(
        `anonUser_anonymous`,
        JSON.stringify({
          _id: "anonymous",
          isAnonymous: true,
          isPremium: false,
          dailyRequestsCount: userRequestsCount + 1,
          lastRequestDate: new Date().toISOString(),
        })
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.code === "LIMIT_EXCEEDED") {
        setError(errorData.error);
        setShowDummyPaymentModal(true);
        return;
      }
      throw new Error(errorData.error || `Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.notes) setNotes(data.notes);
    if (data.videos) setVideos(data.videos);

    localStorage.setItem(
      "lastStudyOutput",
      JSON.stringify({
        notes: data.notes || "",
        videos: data.videos || [],
        searchedTopic: topic,
      })
    );
  } catch (err) {
    setError(`Failed to fetch: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  // const handleAskBuddy = async () => {
  //   if (!selectedText) return;

  //   if (!user || user.isAnonymous) {
  //     setShowLoginModal(true);
  //     setError("Please log in to use StudyBuddy.");
  //     return;
  //   }

  //   if (checkAndHandleLimit()) {
  //     return;
  //   }

  //   setExplanationLoading(true);
  //   setBuddyExplanation("");
  //   setShowExplanationModal(true);
  //   setShowPopup(false);

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/explain`,
  //       commonFetchOptions("POST", { selectedText, contextNotes: notes })
  //     );

  //     if (user && !user.isPremium) {
  //       const updatedUser = {
  //         ...user,
  //         dailyRequestsCount: (user.dailyRequestsCount || 0) + 1,
  //       };
  //       updateUsageAndUser(updatedUser);
  //     }

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       if (errorData.code === "LIMIT_EXCEEDED") {
  //         setError(errorData.error);
  //         setShowExplanationModal(false);
  //         setShowDummyPaymentModal(true);
  //         return;
  //       }
  //       throw new Error(errorData.error || `Status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setBuddyExplanation(data.explanation);
  //   } catch (err) {
  //     setBuddyExplanation(`Failed to get explanation: ${err.message}`);
  //   } finally {
  //     setExplanationLoading(false);
  //     setSelectedText("");
  //     window.getSelection().removeAllRanges();
  //   }
  // };
  const handleAskBuddy = async () => {
  if (!selectedText) return;

  if (checkAndHandleLimit()) {
    return;
  }

  setExplanationLoading(true);
  setBuddyExplanation("");
  setShowExplanationModal(true);
  setShowPopup(false);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/explain`,
      commonFetchOptions("POST", { selectedText, contextNotes: notes })
    );

    if (user && !user.isPremium) {
      const updatedUser = {
        ...user,
        dailyRequestsCount: (user.dailyRequestsCount || 0) + 1,
      };
      updateUsageAndUser(updatedUser);
    }

    // Increment anonymous usage count
    if (!user) {
      setUserRequestsCount((prev) => prev + 1);
      localStorage.setItem(
        "anonymousUserId",
        "anonymous"
      );
      localStorage.setItem(
        `anonUser_anonymous`,
        JSON.stringify({
          _id: "anonymous",
          isAnonymous: true,
          isPremium: false,
          dailyRequestsCount: userRequestsCount + 1,
          lastRequestDate: new Date().toISOString(),
        })
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.code === "LIMIT_EXCEEDED") {
        setError(errorData.error);
        setShowExplanationModal(false);
        setShowDummyPaymentModal(true);
        return;
      }
      throw new Error(errorData.error || `Status: ${response.status}`);
    }

    const data = await response.json();
    setBuddyExplanation(data.explanation);
  } catch (err) {
    setBuddyExplanation(`Failed to get explanation: ${err.message}`);
  } finally {
    setExplanationLoading(false);
    setSelectedText("");
    window.getSelection().removeAllRanges();
  }
};

  const mockLogout = () => {
    localStorage.removeItem("user");
    
    localStorage.removeItem("lastStudyOutput");
    setNotes("");
    setVideos([]);
    setSearchedTopic("");
    setUser(null);
    setUserRequestsCount(0);
  };

  const LoginModal = ({ onClose }) => {
    const navigate = useNavigate();
    const handleLogin = () => {
      setShowLoginModal(false);
      navigate("/login");
    };
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-sky-700 mb-2">
              Login Required
            </h2>
            <p className="text-sky-600">
              You've used your free submission! Please login with your real
              account to continue learning.
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  };
  const ExplanationModal = ({
    explanation,
    loading,
    onClose,
    selectedText,
  }) => {
    let parsed = null;

    // Try to parse if it's a string and looks like JSON
    if (explanation && typeof explanation === "string") {
      try {
        // Only parse if it starts with { and ends with }
        if (
          explanation.trim().startsWith("{") &&
          explanation.trim().endsWith("}")
        ) {
          parsed = JSON.parse(explanation);
        }
      } catch {
        parsed = null;
      }
    } else if (explanation && typeof explanation === "object") {
      parsed = explanation;
    }

    // Custom markdown renderers for code blocks
    const markdownComponents = {
      code({ node, inline, className, children, ...props }) {
        return inline ? (
          <code className="bg-sky-100 px-1 rounded text-sky-700" {...props}>
            {children}
          </code>
        ) : (
          <pre className="bg-sky-100 rounded-lg p-4 my-4 overflow-x-auto">
            <code {...props}>{children}</code>
          </pre>
        );
      },
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-sky-700 flex items-center space-x-3">
              <span className="text-4xl">🧠</span>
              <span>Buddy's Explanation</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors text-3xl font-bold"
            >
              &times;
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent mb-4"></div>
              <p className="text-sky-600 text-lg">Buddy is thinking...</p>
            </div>
          ) : (
            <>
              {selectedText && (
                <div className="bg-sky-50 border-l-4 border-sky-200 p-4 mb-6 rounded-lg italic text-sky-700">
                  <p className="font-semibold mb-1">You asked about:</p>
                  <p className="text-base">"{selectedText}"</p>
                </div>
              )}
              <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200 shadow-inner max-h-96 overflow-y-auto prose prose-lg prose-sky max-w-none text-sky-800 leading-relaxed">
                {parsed && typeof parsed === "object" ? (
                  <>
                    {parsed.explanation && (
                      <>
                        <h3 className="text-xl font-bold mb-2">Explanation</h3>
                        <ReactMarkdown components={markdownComponents}>
                          {parsed.explanation}
                        </ReactMarkdown>
                      </>
                    )}
                    {parsed.example && (
                      <>
                        <h3 className="text-xl font-bold mt-6 mb-2">Example</h3>
                        <ReactMarkdown components={markdownComponents}>
                          {parsed.example}
                        </ReactMarkdown>
                      </>
                    )}
                    {parsed.answer && (
                      <>
                        <h3 className="text-xl font-bold mt-6 mb-2">
                          Code/Answer
                        </h3>
                        <ReactMarkdown components={markdownComponents}>
                          {parsed.answer}
                        </ReactMarkdown>
                      </>
                    )}
                  </>
                ) : (
                  <ReactMarkdown components={markdownComponents}>
                    {explanation}
                  </ReactMarkdown>
                )}
              </div>
            </>
          )}

          <div className="text-right mt-6">
            <button
              onClick={onClose}
              className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-semibold py-2 px-5 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  //   const ExplanationModal = ({
  //     explanation,
  //     loading,
  //     onClose,
  //     selectedText,
  //   }) => {
  //     let parsed = null;
  //     try {
  //       parsed =
  //         explanation && typeof explanation === "string"
  //           ? JSON.parse(explanation)
  //           : null;
  //     } catch {
  //       // fallback: not JSON, treat as plain markdown
  //       parsed = null;
  //     }

  //     return (
  //       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  //         <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform animate-scale-in">
  //           <div className="flex justify-between items-center mb-6">
  //             <h2 className="text-3xl font-bold text-sky-700 flex items-center space-x-3">
  //               <span className="text-4xl">🧠</span>
  //               <span>Buddy's Explanation</span>
  //             </h2>
  //             <button
  //               onClick={onClose}
  //               className="text-gray-500 hover:text-gray-700 transition-colors text-3xl font-bold"
  //             >
  //               &times;
  //             </button>
  //           </div>

  //           {loading ? (
  //             <div className="flex flex-col items-center justify-center py-10">
  //               <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent mb-4"></div>
  //               <p className="text-sky-600 text-lg">Buddy is thinking...</p>
  //             </div>
  //           ) : (
  //             <>
  //               {selectedText && (
  //                 <div className="bg-sky-50 border-l-4 border-sky-200 p-4 mb-6 rounded-lg italic text-sky-700">
  //                   <p className="font-semibold mb-1">You asked about:</p>
  //                   <p className="text-base">"{selectedText}"</p>
  //                 </div>
  //               )}
  //               <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200 shadow-inner max-h-96 overflow-y-auto prose prose-lg prose-sky max-w-none text-sky-800 leading-relaxed">
  //                 {parsed ? (
  //                   <>
  //                     {parsed.explanation && (
  //                       <>
  //                         <h3 className="text-xl font-bold mb-2">Explanation</h3>
  //                         <ReactMarkdown>{parsed.explanation}</ReactMarkdown>
  //                       </>
  //                     )}
  //                     {parsed.example && (
  //                       <>
  //                         <h3 className="text-xl font-bold mt-6 mb-2">Example</h3>
  //                         <ReactMarkdown>{parsed.example}</ReactMarkdown>
  //                       </>
  //                     )}
  //                     {parsed.answer && (
  //                       <>
  //                         <h3 className="text-xl font-bold mt-6 mb-2">Answer</h3>
  //                         <ReactMarkdown>{parsed.answer}</ReactMarkdown>
  //                       </>
  //                     )}
  //                   </>
  //                 ) : (
  //                   <ReactMarkdown>{explanation}</ReactMarkdown>
  //                 )}
  //               </div>
  //             </>
  //           )}

  //           <div className="text-right mt-6">
  //             <button
  //               onClick={onClose}
  //               className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-semibold py-2 px-5 rounded-xl transition-all duration-300"
  //             >
  //               Close
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   };

  // Dummy Payment Modal Component
  const DummyPaymentModal = ({ onClose, onSimulateTomorrow }) => {
    const handleSimulateTomorrow = () => {
      if (user) {
        onSimulateTomorrow({
          ...user,
          dailyRequestsCount: 0,
          lastRequestDate: new Date().toISOString(),
        });
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-orange-700 mb-2">
              Daily Limit Reached - Demo Mode
            </h2>
            <p className="text-orange-600">
              You've used your {effectiveDailyLimit} free requests for today.
              This is a demo payment page.
              <br />
              <br />
              <b>Please come back tomorrow for more free uses!</b>
            </p>
            <p className="text-lg font-bold text-orange-800 mt-4">
              (In a real app, this is where a payment gateway like Razorpay
              would appear.)
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSimulateTomorrow}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Simulate Tomorrow / Reset Daily Limit
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSimulateTomorrow = (updatedUser) => {
    updateUsageAndUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header with Auth Status */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="flex items-center space-x-4">
           {user ? (
  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-sky-200">
    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
      <span className="text-white font-bold">
        {user.username ? user.username[0] : "?"}
      </span>
    </div>
    <span className="text-sky-700 font-medium">
      {`Welcome, ${user.username}!`}
    </span>
    {user.isPremium ? (
      <span className="text-purple-600 font-bold text-sm">
        PREMIUM ✨
      </span>
    ) : (
      <span className="text-amber-600 text-sm">
        {userRequestsCount} / {LOGGED_IN_FREE_LIMIT}
      </span>
    )}
    <button
      onClick={mockLogout}
      className="text-sky-600 hover:text-sky-800 font-medium text-sm transition-colors"
    >
      Logout
    </button>
  </div>
) : (
  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-sky-200">
    <span className="text-sky-600 text-sm">
      Please log in to use StudyBuddy
    </span>
  </div>
)}
          
        {/* Floating Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl mb-6 shadow-2xl shadow-sky-200">
            <span className="text-4xl">☁️</span>
          </div>
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 mb-4 tracking-tight">
            StudyBuddy
          </h1>
          <p className="text-xl text-sky-600 font-medium">
            Your intelligent learning companion in the cloud
          </p>
        </div>

        {/* Main Study Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-200/50 border border-sky-100 p-10 mb-10 hover:shadow-3xl hover:shadow-sky-300/30 transition-all duration-500">
          <div className="space-y-10">
            {/* Topic Input Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">✨</span>
                </div>
                <label
                  htmlFor="topic"
                  className="text-2xl font-bold text-sky-700"
                >
                  What would you like to explore today?
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="topic"
                  className="w-full p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 shadow-inner focus:outline-none focus:ring-4 focus:ring-sky-300/50 focus:border-sky-400 text-sky-800 text-xl placeholder-sky-400 transition-all duration-300 hover:shadow-lg"
                  placeholder="e.g., Artificial Intelligence, Quantum Physics, Web Development..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Style Selection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-sky-700">
                  Choose your learning style
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    type: "notes",
                    icon: "📚",
                    title: "Study Notes",
                    desc: "Comprehensive written content",
                    gradient: "from-emerald-400 to-teal-500",
                  },
                  {
                    type: "videos",
                    icon: "🎬",
                    title: "Video Library",
                    desc: "Visual learning resources",
                    gradient: "from-rose-400 to-pink-500",
                  },
                  {
                    type: "both",
                    icon: "🚀",
                    title: "Complete Suite",
                    desc: "Notes + Videos combined",
                    gradient: "from-violet-400 to-purple-500",
                  },
                ].map(({ type, icon, title, desc, gradient }) => (
                  <label
                    key={type}
                    className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedType === type ? "scale-105" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="materialType"
                      value={type}
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="sr-only"
                    />
                    <div
                      className={`relative p-8 rounded-2xl border-3 transition-all duration-300 ${
                        selectedType === type
                          ? "bg-gradient-to-br from-sky-100 to-blue-100 border-sky-400 shadow-xl shadow-sky-200/50"
                          : "bg-white/60 border-sky-200 hover:border-sky-300 hover:bg-sky-50/80 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      <div className="text-center space-y-4">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg`}
                        >
                          <span className="text-3xl">{icon}</span>
                        </div>
                        <div>
                          <h4 className="text-sky-800 font-bold text-xl mb-2">
                            {title}
                          </h4>
                          <p className="text-sky-600 text-sm leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>
                      {selectedType === type && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || (!user?.isPremium && hasReachedLimit)}
                className={`w-full font-bold py-6 px-8 rounded-2xl text-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${
                  user && user.isPremium
                    ? "bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 hover:from-sky-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-sky-300/50 hover:shadow-sky-400/60"
                    : hasReachedLimit
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-300/50 hover:shadow-orange-400/60"
                    : "bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 hover:from-sky-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-sky-300/50 hover:shadow-sky-400/60"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                    <span className="text-lg">
                      Crafting your study materials...
                    </span>
                  </div>
                ) : hasReachedLimit ? (
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">🚫</span>
                    <span className="text-lg">
                      Daily Quota Reached - Visit us tomorrow!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <span className="text-lg">
                      {user && user.isPremium
                        ? "Generate More Materials"
                        : "Generate Study Materials"}
                    </span>
                  </div>
                )}
              </button>

              {(!user || !user.isPremium) && (
                <p className="text-center text-sky-600 text-sm mt-3">
                  🎉{" "}
                  {effectiveDailyLimit - userRequestsCount > 0
                    ? `${
                        effectiveDailyLimit - userRequestsCount
                      } free searches remaining today!`
                    : "Your daily quota is done for today!"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 rounded-2xl p-6 mb-8 shadow-xl shadow-red-100/50 animate-fade-in">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Something went wrong</h3>
                <p className="text-red-600 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Study Notes Section */}
        {/* {notes && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-200/30 border border-emerald-100 p-10 mb-10 animate-fade-in">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">📖</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">
                  Study Notes
                </h2>
                <p className="text-emerald-600 text-lg">
                  Deep dive into{" "}
                  <span className="font-semibold text-sky-600">
                    {searchedTopic}
                  </span>
                </p>
              </div>
            </div>
            <div
              ref={notesRef}
              onMouseUp={handleTextSelection}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 shadow-inner prose prose-lg prose-emerald max-w-none text-emerald-800 leading-relaxed"
            >
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        )} */}
        {notes && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-200/30 border border-emerald-100 p-10 mb-10 animate-fade-in">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">📖</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">
                  Study Notes
                </h2>
                <p className="text-emerald-600 text-lg">
                  Deep dive into{" "}
                  <span className="font-semibold text-sky-600">
                    {searchedTopic}
                  </span>
                </p>
              </div>
            </div>
            <div
              ref={notesRef}
              onMouseUp={handleTextSelection}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 shadow-inner max-w-none text-emerald-800 leading-relaxed"
              style={{
                maxHeight: "600px",
                overflowX: "auto",
                overflowY: "auto",
                fontSize: "1.1rem",
              }}
            >
              <div className="prose prose-lg prose-emerald max-w-none">
                <ReactMarkdown
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6">
                        <table
                          className="min-w-full border border-emerald-200"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-emerald-100" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="px-4 py-2 border-b border-emerald-300 text-emerald-700 font-semibold text-left"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="px-4 py-2 border-b border-emerald-100"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, className, children, ...props }) =>
                      inline ? (
                        <code
                          className="bg-emerald-100 px-1 rounded text-emerald-700"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-emerald-100 rounded-lg p-4 my-4 overflow-x-auto">
                          <code {...props}>{children}</code>
                        </pre>
                      ),
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-3xl font-bold mt-8 mb-4 text-emerald-700"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-bold mt-6 mb-3 text-emerald-700"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-bold mt-4 mb-2 text-emerald-700"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc ml-6 my-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal ml-6 my-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                  }}
                >
                  {notes}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        {/* Selected Text Pop-up */}
        {showPopup && selectedText && (
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              top: popupPosition.y,
              left: popupPosition.x,
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
            className="bg-sky-700 text-white py-2 px-4 rounded-xl shadow-lg border border-sky-500 animate-fade-in-up"
          >
            <button
              onClick={handleAskBuddy}
              className="flex items-center space-x-2 text-white font-medium hover:text-sky-200 transition-colors"
            >
              <span className="text-lg">🧠</span>
              <span>Ask Buddy to explain this</span>
            </button>
          </div>
        )}

        {/* Video Resources Section */}
        {videos.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-200/30 border border-rose-100 p-10 animate-fade-in">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">🎥</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-rose-700">
                  Video Resources
                </h2>
                <p className="text-rose-600 text-lg">
                  Visual learning about{" "}
                  <span className="font-semibold text-sky-600">
                    {searchedTopic}
                  </span>
                </p>
              </div>
            </div>
            <div className="grid gap-6">
              {/* {videos.map((video, idx) => (
                <a
                  key={idx}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 rounded-2xl border-2 border-rose-200 hover:border-rose-300 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-rose-200/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-rose-800 font-bold text-xl mb-2 group-hover:text-sky-700 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-rose-600 flex items-center space-x-2">
                      <span>Watch on YouTube</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </p>
                  </div>
                </a>
              ))} */}
              {videos.map((video, idx) => {
                // Extract the video ID from the URL
                const match = video.url.match(/v=([^&]+)/);
                const videoId = match ? match[1] : "";
                const thumbnailUrl = videoId
                  ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                  : "";

                return (
                  <a
                    key={idx}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 rounded-2xl border-2 border-rose-200 hover:border-rose-300 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-rose-200/50"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="w-28 h-20 object-cover rounded-xl mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    />
                    <div className="flex-1">
                      <h3 className="text-rose-800 font-bold text-xl mb-2 group-hover:text-sky-700 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-rose-600 flex items-center space-x-2">
                        <span>Watch on YouTube</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Explanation Modal */}
      {showExplanationModal && (
        <ExplanationModal
          explanation={buddyExplanation}
          loading={explanationLoading}
          onClose={() => setShowExplanationModal(false)}
          selectedText={selectedText}
        />
      )}

      {/* Dummy Payment Modal */}
      {showDummyPaymentModal && (
        <DummyPaymentModal
          onClose={() => setShowDummyPaymentModal(false)}
          onSimulateTomorrow={handleSimulateTomorrow}
        />
      )}
    </div>
  );
};

export default StudyBuddy;
