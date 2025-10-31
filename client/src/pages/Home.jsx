import React from "react";
import useFetch from "../hooks/useFetch";
import { postService } from "../services/api";
import PostCard from "../components/PostCard";

export default function Home() {
const { data: posts, setData: setPosts, loading, error, run } = useFetch(
    () => postService.getAllPosts()
);

  // Optimistic delete
const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    const previous = posts ? [...posts] : [];
    // update UI immediately
    setPosts((p) => p && p.filter((x) => String(x._id) !== String(id)));
    try {
    await postService.deletePost(id);
    } catch (err) {
      // revert UI on failure
    setPosts(previous);
    alert("Failed to delete post: " + (err?.message || err));
    }
};

if (loading) return <div className="p-6">Loading posts…</div>;
if (error) return <div className="p-6 text-red-600">Error loading posts.</div>;
if (!posts || posts.length === 0)
    return (
    <div className="p-6">
        <div className="mb-4">No posts yet.</div>
    </div>
    );

return (
    <div>
    <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
    {posts.map((post) => (
        <PostCard key={post._id || post.slug} post={post} onDelete={handleDelete} />
    ))}
    </div>
);
}
