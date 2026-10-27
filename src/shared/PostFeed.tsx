import type { PostType } from "./types";
import FeedPost from "./FeedPost";

export default function PostFeed({ posts }: { posts: PostType[] }) {
  return (
    <div className="feed">
      {posts.map(post => <FeedPost key={post.slug} post={post} />)}
    </div>
  );
}
