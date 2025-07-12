const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");

// Get all blog posts with filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      tag,
      author,
      targetAudience,
      featured,
      popular,
      language,
      page = 1,
      limit = 12,
      search,
      sort = "-publishedAt",
    } = req.query;

    let query = {
      status: "published",
      publishedAt: { $lte: new Date() },
    };

    // Only filter by language if specified
    if (language) {
      query.lang = language;
    }

    // Apply filters
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (targetAudience) query.targetAudience = targetAudience;
    if (featured === "true") query["settings.isFeatured"] = true;

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Handle popular posts
    if (popular === "true") {
      const popularPosts = await Blog.getPopularPosts(parseInt(limit));
      return res.json({
        success: true,
        data: popularPosts,
        pagination: {
          current: 1,
          total: 1,
          count: popularPosts.length,
          totalResults: popularPosts.length,
        },
      });
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case "popular":
        sortOptions = { "views.count": -1, likesCount: -1 };
        break;
      case "oldest":
        sortOptions = { publishedAt: 1 };
        break;
      case "title":
        sortOptions = { title: 1 };
        break;
      case "comments":
        sortOptions = { commentsCount: -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }

const posts = await Blog.find(query)
  .populate("author", "firstName lastName avatar")
  .select("-content") // Only exclude content
  .sort(sortOptions)
  .limit(parseInt(limit))
  .skip(skip);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalResults: total,
      },
      filters: {
        category,
        tag,
        author,
        targetAudience,
        featured,
        language: language || "any",
        search,
        sort,
      },
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
    });
  }
});

// Get featured posts
router.get("/featured", async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const featuredPosts = await Blog.getFeaturedPosts(parseInt(limit));

    res.json({
      success: true,
      data: featuredPosts,
    });
  } catch (error) {
    console.error("Get featured posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết nổi bật",
    });
  }
});

// Search blog posts
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      category,
      tag,
      author,
      targetAudience,
      language,
      page = 1,
      limit = 12,
      sort = "relevance",
    } = req.query;

    let query = {
      status: "published",
      publishedAt: { $lte: new Date() },
      lang: language,
    };

    // Apply filters
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (targetAudience) query.targetAudience = targetAudience;

    // Search query
    if (q) {
      query.$text = { $search: q };
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOptions = {};
    if (q && sort === "relevance") {
      sortOptions = { score: { $meta: "textScore" } };
    } else {
      switch (sort) {
        case "newest":
          sortOptions = { publishedAt: -1 };
          break;
        case "oldest":
          sortOptions = { publishedAt: 1 };
          break;
        case "popular":
          sortOptions = { "views.count": -1 };
          break;
        default:
          sortOptions = { publishedAt: -1 };
      }
    }

    const posts = await Blog.find(query)
      .populate("author", "firstName lastName avatar")
      .select("-content -comments")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalResults: total,
      },
      searchQuery: q,
      filters: {
        category,
        tag,
        author,
        targetAudience,
        sort,
      },
    });
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm bài viết",
    });
  }
});

// Get blog categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      {
        $match: {
          status: "published",
          publishedAt: { $lte: new Date() },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          latestPost: { $max: "$publishedAt" },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          latestPost: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Category labels in Vietnamese
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

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      label: categoryLabels[cat.category] || cat.category,
    }));

    res.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh mục bài viết",
    });
  }
});

// Get popular tags
router.get("/tags", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Blog.aggregate([
      {
        $match: {
          status: "published",
          publishedAt: { $lte: new Date() },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          tag: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thẻ tag",
    });
  }
});

router.get("/:identifier/comments", async (req, res) => {
  try {
    const { identifier } = req.params;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }

    const post = await Blog.findOne(query)
      .populate("comments.userId", "firstName lastName avatar")
      .select("comments");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Filter approved comments for non-staff users
    let comments = post.comments;
    if (!req.user || !req.user.hasPermission("staff")) {
      comments = comments.filter(comment => comment.isApproved);
    }

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bình luận",
    });
  }
});

// New route: Get related posts
router.get("/:identifier/related", async (req, res) => {
  try {
    const { identifier } = req.params;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }

    const post = await Blog.findOne(query);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const relatedPosts = await post.getRelatedPosts(3);

    res.json({
      success: true,
      data: relatedPosts,
    });
  } catch (error) {
    console.error("Get related posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết liên quan",
    });
  }
});

// New route: Increment view count
router.post("/:identifier/view", async (req, res) => {
  try {
    const { identifier } = req.params;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }

    const post = await Blog.findOne(query);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    await post.incrementViews(req.user?._id);

    res.json({
      success: true,
      message: "Đã ghi nhận lượt xem",
      data: {
        views: post.views.count,
        uniqueViews: post.views.uniqueViews,
      },
    });
  } catch (error) {
    console.error("Increment view error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi ghi nhận lượt xem",
    });
  }
});

// Get blog post by ID or slug
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }

    const post = await Blog.findOne(query)
      .populate("author", "firstName lastName avatar email")
      .populate("comments.userId", "firstName lastName avatar")
      .populate("relatedPosts", "title slug excerpt featuredImage publishedAt");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Check if post is published
    if (post.status !== "published" || post.publishedAt > new Date()) {
      if (!req.user || !req.user.hasPermission("staff")) {
        return res.status(404).json({
          success: false,
          message: "Bài viết chưa được xuất bản",
        });
      }
    }

    // Increment view count
    await post.incrementViews(req.user?._id);

    // Get related posts if not already populated
    let relatedPosts = post.relatedPosts;
    if (!relatedPosts.length) {
      relatedPosts = await post.getRelatedPosts(3);
    }

    // Hide unapproved comments for non-staff users
    let postData = post.toObject();
    if (!req.user || !req.user.hasPermission("staff")) {
      postData.comments = postData.comments.filter(comment => comment.isApproved);
    }

    res.json({
      success: true,
      data: {
        ...postData,
        relatedPosts,
        isLiked: req.user 
          ? post.likes.some(like => like.userId.toString() === req.user._id.toString())
          : false,
      },
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết",
    });
  }
});

// Create new blog post (staff and above)
router.post("/", auth, authorize("staff"), async (req, res) => {
  try {
    const post = new Blog({
      ...req.body,
      author: req.user._id,
      lastModifiedBy: req.user._id,
    });

    await post.save();

    await post.populate("author", "firstName lastName avatar");

    res.status(201).json({
      success: true,
      message: "Bài viết đã được tạo thành công",
      data: post,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết",
      error: error.message,
    });
  }
});

// Update blog post
router.put("/:id", auth, authorize("staff"), async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Check permissions
    const canUpdate = 
      req.user._id.toString() === post.author.toString() ||
      req.user.hasPermission("manager");

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa bài viết này",
      });
    }

    const updatedPost = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("author", "firstName lastName avatar");

    res.json({
      success: true,
      message: "Bài viết đã được cập nhật thành công",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết",
      error: error.message,
    });
  }
});

// Delete blog post (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    res.json({
      success: true,
      message: "Bài viết đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết",
    });
  }
});

// Like/unlike blog post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    if (!post.settings.allowLikes) {
      return res.status(400).json({
        success: false,
        message: "Bài viết này không cho phép thích",
      });
    }

    await post.toggleLike(req.user._id);

    const isLiked = post.likes.some(
      like => like.userId.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      message: isLiked ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
      data: {
        isLiked,
        likesCount: post.likes.length,
      },
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thích bài viết",
    });
  }
});

// Add comment to blog post
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
      });
    }

    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    if (!post.settings.allowComments) {
      return res.status(400).json({
        success: false,
        message: "Bài viết này không cho phép bình luận",
      });
    }

    await post.addComment({
      userId: req.user._id,
      content: content.trim(),
      parentComment,
    });

    // Get the latest comment with user info
    const updatedPost = await Blog.findById(req.params.id)
      .populate("comments.userId", "firstName lastName avatar")
      .select("comments");

    const latestComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: post.settings.requireApproval 
        ? "Bình luận đã được gửi và đang chờ duyệt"
        : "Bình luận đã được thêm thành công",
      data: latestComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi thêm bình luận",
    });
  }
});

// Update comment (comment author only)
router.put("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const comment = post.comments.find(
      c => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận",
      });
    }

    // Check permissions
    if (comment.userId.toString() !== req.user._id.toString() && 
        !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa bình luận này",
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await post.save();

    res.json({
      success: true,
      message: "Bình luận đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bình luận",
    });
  }
});

// Delete comment
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const comment = post.comments.find(
      c => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận",
      });
    }

    // Check permissions
    if (comment.userId.toString() !== req.user._id.toString() && 
        !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xóa bình luận này",
      });
    }

    post.comments = post.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );

    await post.save();

    res.json({
      success: true,
      message: "Bình luận đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bình luận",
    });
  }
});

// Get blog statistics (manager and above)
router.get("/stats/overview", auth, authorize("manager"), async (req, res) => {
  try {
    const { startDate, endDate, category, author } = req.query;
    
    let matchConditions = { status: "published" };
    
    if (startDate && endDate) {
      matchConditions.publishedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (category) matchConditions.category = category;
    if (author) matchConditions.author = author;

    const stats = await Blog.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: "$views.count" },
          totalLikes: { $sum: { $size: "$likes" } },
          totalComments: { $sum: { $size: "$comments" } },
          avgReadingTime: { $avg: "$readingTime" },
        },
      },
      {
        $project: {
          totalPosts: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          avgReadingTime: { $round: ["$avgReadingTime", 1] },
          _id: 0,
        },
      },
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views.count" },
          avgLikes: { $avg: { $size: "$likes" } },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          totalViews: 1,
          avgLikes: { $round: ["$avgLikes", 1] },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryBreakdown: categoryStats,
      },
    });
  } catch (error) {
    console.error("Get blog stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê blog",
    });
  }
});

// ==================== ADMIN CRUD ROUTES ====================

// @route   GET /api/blogs/admin/all
// @desc    Get all blogs for admin (with pagination and filtering)
// @access  Private (Admin and Manager)
router.get("/admin/all", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const {
      status,
      category,
      author,
      featured,
      language,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    let query = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (featured !== undefined && featured !== "") query["settings.isFeatured"] = featured === "true";
    if (language) query.lang = language;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case "title":
        sortOptions = { title: 1 };
        break;
      case "author":
        sortOptions = { author: 1 };
        break;
      case "category":
        sortOptions = { category: 1 };
        break;
      case "views":
        sortOptions = { "views.count": -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const blogs = await Blog.find(query)
      .populate("author", "firstName lastName email")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: blogs.length,
        totalResults: total,
      },
      filters: {
        status,
        category,
        author,
        featured,
        language,
        search,
        sort,
      },
    });
  } catch (error) {
    console.error("Admin get blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
    });
  }
});

// @route   POST /api/blogs/admin/create
// @desc    Create new blog (Admin and Manager)
// @access  Private (Admin and Manager)
router.post("/admin/create", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      targetAudience,
      language,
      status,
      featuredImage,
      seo,
      settings,
      scheduledFor,
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Slug đã tồn tại, vui lòng thay đổi tiêu đề",
      });
    }

    // Create blog object
    const blogData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags || [],
      targetAudience: targetAudience || [],
      lang: language || "vi",
      status: status || "draft",
      author: req.user._id,
      featuredImage,
      seo,
      settings: {
        allowComments: settings?.allowComments !== undefined ? settings.allowComments : true,
        requireApproval: settings?.requireApproval !== undefined ? settings.requireApproval : false,
        allowLikes: settings?.allowLikes !== undefined ? settings.allowLikes : true,
        isFeatured: settings?.isFeatured !== undefined ? settings.isFeatured : false,
        isPinned: settings?.isPinned !== undefined ? settings.isPinned : false,
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    };

    // Set publishedAt if status is published
    if (status === "published") {
      blogData.publishedAt = new Date();
    }

    const blog = new Blog(blogData);
    await blog.save();

    // Populate author info
    await blog.populate("author", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      data: blog,
    });
  } catch (error) {
    console.error("Admin create blog error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết",
    });
  }
});

// @route   PUT /api/blogs/admin/:id
// @desc    Update blog by admin or manager
// @access  Private (Admin and Manager)
router.put("/admin/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      targetAudience,
      language,
      status,
      featuredImage,
      seo,
      settings,
      scheduledFor,
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");

      // Check if new slug already exists
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại, vui lòng thay đổi tiêu đề",
        });
      }
    }

    // Update fields
    const updateData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      targetAudience,
      lang: language, // FIXED: use 'lang' instead of 'language'
      status,
      featuredImage,
      seo,
      settings,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      lastModifiedBy: req.user._id,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle status change
    if (status === "published" && blog.status !== "published") {
      updateData.publishedAt = new Date();
    } else if (status !== "published") {
      updateData.publishedAt = undefined;
    }

    // Update blog
    Object.assign(blog, updateData);
    await blog.save();

    // Populate author info
    await blog.populate("author", "firstName lastName email");

    res.json({
      success: true,
      message: "Cập nhật bài viết thành công",
      data: blog,
    });
  } catch (error) {
    console.error("Admin update blog error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết",
    });
  }
});

// @route   DELETE /api/blogs/admin/:id
// @desc    Delete blog by admin or manager (soft delete)
// @access  Private (Admin and Manager)
router.delete("/admin/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Soft delete by setting status to archived
    blog.status = "archived";
    blog.lastModifiedBy = req.user._id;
    await blog.save();

    res.json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Admin delete blog error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết",
    });
  }
});

// @route   POST /api/blogs/admin/:id/restore
// @desc    Restore deleted blog by admin or manager
// @access  Private (Admin and Manager)
router.post("/admin/:id/restore", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Restore blog by setting status to draft
    blog.status = "draft";
    blog.lastModifiedBy = req.user._id;
    await blog.save();

    res.json({
      success: true,
      message: "Khôi phục bài viết thành công",
    });
  } catch (error) {
    console.error("Admin restore blog error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi khôi phục bài viết",
    });
  }
});

// @route   GET /api/blogs/admin/stats
// @desc    Get blog statistics for admin or manager dashboard
// @access  Private (Admin and Manager)
router.get("/admin/stats", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchConditions = {};

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Blog.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draftPosts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          archivedPosts: {
            $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
          },
          totalViews: { $sum: "$views.count" },
          totalLikes: { $sum: { $size: "$likes" } },
          totalComments: { $sum: { $size: "$comments" } },
          featuredPosts: {
            $sum: { $cond: [{ $eq: ["$settings.isFeatured", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          totalPosts: 1,
          publishedPosts: 1,
          draftPosts: 1,
          archivedPosts: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          featuredPosts: 1,
          _id: 0,
        },
      },
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          views: { $sum: "$views.count" },
          likes: { $sum: { $size: "$likes" } },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          views: 1,
          likes: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const statusStats = await Blog.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent posts
    const recentPosts = await Blog.find()
      .populate("author", "firstName lastName")
      .select("title status category createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryBreakdown: categoryStats,
        statusBreakdown: statusStats,
        recentPosts,
      },
    });
  } catch (error) {
    console.error("Admin get blog stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
    });
  }
});

module.exports = router;
