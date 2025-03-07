import React from "react";

interface ErrorScreenProps {
  errorMessage: string;
  width: number;
  height: number;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorMessage,
  width,
  height,
  onRetry,
}) => {
  return (
    <div
      className="absolute flex flex-col justify-center items-center bg-red-900 bg-opacity-90 z-10 text-white"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Error Icon */}
      <div className="mb-6 text-red-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-16 h-16"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Error Title */}
      <h2 className="text-3xl font-bold mb-4 text-red-100">
        Oops! Something went wrong
      </h2>

      {/* Error Message */}
      <div className="mb-8 px-4 py-3 bg-red-800 bg-opacity-50 rounded-lg max-w-md text-center">
        <p className="text-red-100">{errorMessage}</p>
      </div>

      {/* Retry Button */}
      <button
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-300 font-medium text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
        onClick={onRetry}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
            clipRule="evenodd"
          />
        </svg>
        Try Again
      </button>

      {/* Helpful Note */}
      <p className="mt-8 text-sm text-red-300 max-w-xs text-center">
        If the problem persists, try refreshing the page or check your
        connection.
      </p>
    </div>
  );
};

export default ErrorScreen;
