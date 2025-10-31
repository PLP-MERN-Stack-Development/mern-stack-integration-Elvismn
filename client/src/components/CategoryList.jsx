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
    <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Categories</h2>
    <ul>
        {categories.map((cat) => (
        <li key={cat._id}>
            <strong>{cat.name}</strong> — {cat.description}
        </li>
        ))}
    </ul>
    </div>
);
};

export default CategoryList;
