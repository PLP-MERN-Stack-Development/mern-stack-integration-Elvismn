// /client/src/components/CategoryList.jsx
import React, { useEffect, useState } from "react";
import { getAllCategories } from "../services/api";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
        🗂️ Categories
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-lg hover:bg-gray-100 transition duration-200"
          >
            <h3 className="text-lg font-bold text-indigo-700 mb-1">
              {cat.name}
            </h3>
            <p className="text-sm text-gray-600">{cat.description}</p>
          </li>
        ))}
      </ul>
      {categories.length === 0 && (
        <p className="text-gray-500 text-center mt-6">No categories found.</p>
      )}
    </div>
  );
};

export default CategoryList;
