import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { postService } from "../services/api";

export default function SinglePost() {
  const { slug } = useParams(); // ✅ fetch by slug instead of id
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    postService
      .getPost(slug) // ✅ slug here
      .then((res) => {
        if (mounted) setPost(res);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [slug]);

  if (loading) return <div className="p-6">Loading post…</div>;
  if (error) return <div className="p-6 text-red-600">Error loading post.</div>;
  if (!post) return <div className="p-6">Post not found.</div>;

  return (
    <article className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {post.author?.name || "Author"} • {new Date(post.createdAt).toLocaleString()}
      </div>
      {post.featuredImage && (
        <img
          src={
            post.featuredImage.startsWith("http")
              ? post.featuredImage
              : `/uploads/${post.featuredImage}`
          }
          alt={post.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-6 text-sm text-gray-500">Views: {post.viewCount}</div>
    </article>
  );
}
