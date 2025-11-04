// src/components/PostCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post, onDelete }) {
  const postLink = `/posts/${post.slug}`;

  // build image URL if available
  const featuredUrl = post.featuredImage
    ? (post.featuredImage.startsWith("http") ? post.featuredImage : `/uploads/${post.featuredImage}`)
    : null;

  return (
    <article className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <Link to={postLink}>
            <h3 className="text-xl font-semibold hover:text-blue-600 transition">{post.title}</h3>
          </Link>
          {featuredUrl && <img src={featuredUrl} alt={post.title} className="w-full h-44 object-cover rounded mt-2" />}
          <p className="text-sm text-gray-500 mt-1">{post.excerpt || (post.content && post.content.substring(0, 120) + "...")}</p>
          <div className="text-xs text-gray-400 mt-2">
            <span>{post.category?.name || "Uncategorized"}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link to={postLink} className="text-sm px-3 py-1 border rounded hover:bg-gray-50">View</Link>
          <button onClick={() => onDelete(post._id)} className="text-sm px-3 py-1 border rounded text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
    </article>
  );
}
