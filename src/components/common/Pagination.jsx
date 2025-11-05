import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // ✅ đổi totalPage → totalPages
  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-4 py-2 rounded-lg border ${
          currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        Prev
      </button>

       {Array.from({ length: totalPages }, (_, i) => (
          <li key={i} className="list-none" >
            <button
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-purple-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-purple-100"
              }`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          </li>
        ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-4 py-2 rounded-lg border ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
