import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);

  const categoryLabels = {
    news: "Tin tức",
    education: "Giáo dục",
    prevention: "Phòng ngừa",
    research: "Nghiên cứu",
    success_stories: "Câu chuyện thành công",
    community: "Cộng đồng",
    health: "Sức khỏe",
    family: "Gia đình",
    resources: "Tài nguyên",
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchRelatedPosts();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${id}`);
      if (response.data.success) {
        const postData = response.data.data;
        setPost(postData);
        setLikesCount(postData.likes?.length || 0);
        
        if (isAuthenticated && user) {
          setIsLiked(postData.likes?.includes(user._id) || false);
          setIsBookmarked(user.bookmarkedPosts?.includes(postData._id) || false);
        }
        
        // Track view
        await api.post(`/blogs/${id}/view`);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Không thể tải bài viết");
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/blogs/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await api.get(`/blogs/${id}/related`);
      if (response.data.success) {
        setRelatedPosts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    try {
      const response = await api.post(`/blogs/${id}/like`);
      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể thích bài viết");
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu bài viết");
      return;
    }

    try {
      const response = await api.post(`/blogs/${id}/bookmark`);
      if (response.data.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error("Không thể lưu bài viết");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await api.post(`/blogs/${id}/comments`, {
        content: newComment.trim()
      });
      
      if (response.data.success) {
        setComments(prev => [response.data.data, ...prev]);
        setNewComment("");
        toast.success("Đã thêm bình luận!");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Không thể thêm bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link bài viết!");
      } catch (error) {
        toast.error("Không thể sao chép link");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy bài viết
            </h1>
            <button onClick={() => navigate("/blog")} className="btn-primary">
              Quay lại Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/blog")}
          className="mb-6 btn-outline"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay lại Blog
        </motion.button>

        {/* Article Header */}
        <motion.article 
          className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video bg-gray-200">
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Category */}
            <div className="mb-4">
              <span className="blog-category">
                {categoryLabels[post.category] || post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>
                  {post.author?.firstName} {post.author?.lastName}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>{getReadingTime(post.content)}</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-2" />
                <span>{post.views?.count || 0} lượt xem</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked 
                    ? "bg-red-100 text-red-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{likesCount}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
                <span>Lưu</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Content */}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thẻ</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-6">
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bình luận ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ suy nghĩ của bạn..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">
                Vui lòng đăng nhập để bình luận
              </p>
              <Link to="/login" className="btn-primary">
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-900">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </h4>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.slice(0, 4).map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  to={`/blog/${relatedPost.slug || relatedPost._id}`}
                  className="group"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {relatedPost.featuredImage && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={relatedPost.featuredImage.url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BlogPost;
