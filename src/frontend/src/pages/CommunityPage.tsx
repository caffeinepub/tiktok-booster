import WhatsAppContactSection from "@/components/WhatsAppContactSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCreatePost, useGetAllPosts } from "@/hooks/useQueries";
import { normalizeBackendError } from "@/lib/backendError";
import { formatTimestamp } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Loader2, LogIn, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CommunityPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [postContent, setPostContent] = useState("");

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useGetAllPosts();
  const createPostMutation = useCreatePost();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postContent.trim()) {
      toast.error("Please enter some content for your post");
      return;
    }

    try {
      await createPostMutation.mutateAsync(postContent.trim());
      setPostContent("");
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(normalizeBackendError(error));
    }
  };

  // Sort posts by timestamp (most recent first)
  const sortedPosts = posts
    ? [...posts].sort((a, b) => {
        return Number(b.timestamp - a.timestamp);
      })
    : [];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join the Community</CardTitle>
            <CardDescription className="text-base">
              Log in to share your thoughts and connect with other users
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                <LogIn className="w-5 h-5" />
                Log In to Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          Community Feed
        </h1>
        <p className="text-muted-foreground">
          Share your thoughts and connect with the community
        </p>
      </div>

      {/* WhatsApp Contact Section */}
      <div className="mb-8">
        <WhatsAppContactSection />
      </div>

      {/* Create Post Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>Share what's on your mind</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">Your Message</Label>
              <Textarea
                id="post-content"
                placeholder="What would you like to share?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={createPostMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || !postContent.trim()}
              className="gap-2"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>

        {postsLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading posts...</p>
            </CardContent>
          </Card>
        )}

        {postsError && (
          <Alert variant="destructive">
            <AlertDescription>
              {normalizeBackendError(postsError)}
            </AlertDescription>
          </Alert>
        )}

        {!postsLoading && !postsError && sortedPosts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No posts yet. Be the first to share something!
              </p>
            </CardContent>
          </Card>
        )}

        {!postsLoading &&
          !postsError &&
          sortedPosts.map((post) => (
            <Card key={post.postId.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {post.author.toString().slice(0, 8)}...
                      {post.author.toString().slice(-6)}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {formatTimestamp(post.timestamp)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
