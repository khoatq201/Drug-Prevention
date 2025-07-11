import React, { useState, useRef, useEffect } from "react";

const OTPInput = ({ length = 6, onComplete, loading = false, error = "" }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "") {
      if (index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Call onComplete when all inputs are filled
    const newOtp = [...otp];
    newOtp[index] = element.value;
    if (newOtp.every((val) => val !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index] !== "") {
        // Clear current input
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData.slice(0, length).split("");

    if (pasteArray.every((char) => !isNaN(char))) {
      const newOtp = [...otp];
      pasteArray.forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex].focus();

      // Call onComplete if all inputs are filled
      if (newOtp.every((val) => val !== "")) {
        onComplete(newOtp.join(""));
      }
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(""));
    inputRefs.current[0].focus();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-3">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={loading}
            className={`
              w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500 
              transition-all duration-200
              ${
                error
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
              }
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
              ${data ? "border-green-500 bg-green-50" : ""}
            `}
          />
        ))}
      </div>

      {error && (
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            type="button"
            onClick={clearOtp}
            className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
          >
            Xóa và nhập lại
          </button>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>Nhập mã 6 chữ số được gửi đến email của bạn</p>
      </div>
    </div>
  );
};

export default OTPInput;
