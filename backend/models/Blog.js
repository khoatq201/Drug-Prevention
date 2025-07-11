const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề bài viết là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Tóm tắt bài viết là bắt buộc"],
      maxlength: [500, "Tóm tắt không được vượt quá 500 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Nội dung bài viết là bắt buộc"],
    },
    featuredImage: {
      url: String,
      alt: String,
      caption: String,
    },
    category: {
      type: String,
      required: [true, "Danh mục bài viết là bắt buộc"],
      enum: [
        "news", // Tin tức
        "education", // Giáo dục
        "prevention", // Phòng ngừa
        "research", // Nghiên cứu
        "success_stories", // Câu chuyện thành công
        "community", // Cộng đồng
        "health", // Sức khỏe
        "family", // Gia đình
        "resources", // Tài nguyên
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tác giả bài viết là bắt buộc"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    targetAudience: [
      {
        type: String,
        enum: ["student", "university_student", "parent", "teacher", "counselor", "general"],
      },
    ],
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    // SEO and metadata
    seo: {
      metaTitle: String,
      metaDescription: {
        type: String,
        maxlength: [160, "Meta description không được vượt quá 160 ký tự"],
      },
      keywords: [String],
      ogImage: String,
    },
    // Publishing information
    publishedAt: Date,
    scheduledFor: Date,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Engagement metrics
    views: {
      count: {
        type: Number,
        default: 0,
      },
      uniqueViews: {
        type: Number,
        default: 0,
      },
      lastViewedAt: Date,
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Comments system
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
          maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
        },
        parentComment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog.comments",
        },
        isApproved: {
          type: Boolean,
          default: true,
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
        editedAt: Date,
        likes: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            likedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        replies: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            content: {
              type: String,
              required: true,
              maxlength: [500, "Phản hồi không được vượt quá 500 ký tự"],
            },
            isApproved: {
              type: Boolean,
              default: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Content settings
    settings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      allowLikes: {
        type: Boolean,
        default: true,
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      isPinned: {
        type: Boolean,
        default: false,
      },
      showAuthor: {
        type: Boolean,
        default: true,
      },
    },
    // Reading metrics
    readingTime: {
      type: Number, // minutes
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    // Related content
    relatedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    // Access control
    visibility: {
      type: String,
      enum: ["public", "members_only", "staff_only"],
      default: "public",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ targetAudience: 1, status: 1 });
blogSchema.index({ 
  title: "text", 
  excerpt: "text", 
  content: "text",
  tags: "text"
});

// Virtual for total likes count
blogSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

// Virtual for total comments count
blogSchema.virtual("commentsCount").get(function () {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Virtual for approved comments
blogSchema.virtual("approvedComments").get(function () {
  return this.comments.filter(comment => comment.isApproved);
});

// Virtual for reading time calculation
blogSchema.virtual("estimatedReadingTime").get(function () {
  if (this.readingTime > 0) return this.readingTime;
  
  const wordsPerMinute = 200;
  const words = this.wordCount || this.content.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
});

// Virtual for checking if post is published
blogSchema.virtual("isPublished").get(function () {
  return this.status === "published" && this.publishedAt && this.publishedAt <= new Date();
});

// Pre-save middleware to generate slug
blogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  // Calculate word count and reading time
  if (this.isModified("content")) {
    this.wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static method to search posts
blogSchema.statics.searchPosts = function (query, filters = {}) {
  const searchCriteria = {
    status: "published",
    publishedAt: { $lte: new Date() },
    ...filters,
  };

  if (query) {
    searchCriteria.$text = { $search: query };
  }

  return this.find(searchCriteria)
    .populate("author", "firstName lastName avatar")
    .sort({ publishedAt: -1 });
};

// Static method to get posts by category
blogSchema.statics.findByCategory = function (category, options = {}) {
  const query = {
    category,
    status: "published",
    publishedAt: { $lte: new Date() },
    ...options,
  };

  return this.find(query)
    .populate("author", "firstName lastName avatar")
    .sort({ publishedAt: -1 });
};

// Static method to get featured posts
blogSchema.statics.getFeaturedPosts = function (limit = 5) {
  return this.find({
    status: "published",
    publishedAt: { $lte: new Date() },
    "settings.isFeatured": true,
  })
    .populate("author", "firstName lastName avatar")
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get popular posts
blogSchema.statics.getPopularPosts = function (limit = 10, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return this.find({
    status: "published",
    publishedAt: { $lte: new Date(), $gte: since },
  })
    .populate("author", "firstName lastName avatar")
    .sort({ "views.count": -1, likesCount: -1 })
    .limit(limit);
};

// Method to increment view count
blogSchema.methods.incrementViews = async function (userId = null) {
  this.views.count += 1;
  this.views.lastViewedAt = new Date();
  
  // Track unique views (simplified - in production, use more sophisticated tracking)
  if (userId) {
    this.views.uniqueViews += 1;
  }
  
  return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = async function (userId) {
  const existingLike = this.likes.find(
    like => like.userId.toString() === userId.toString()
  );

  if (existingLike) {
    this.likes = this.likes.filter(
      like => like.userId.toString() !== userId.toString()
    );
  } else {
    this.likes.push({ userId });
  }

  return this.save();
};

// Method to add comment
blogSchema.methods.addComment = async function (commentData) {
  if (!this.settings.allowComments) {
    throw new Error("Comments are not allowed on this post");
  }

  const comment = {
    ...commentData,
    isApproved: !this.settings.requireApproval,
    createdAt: new Date(),
  };

  this.comments.push(comment);
  return this.save();
};

// Method to get related posts
blogSchema.methods.getRelatedPosts = async function (limit = 3) {
  const relatedPosts = await this.constructor
    .find({
      _id: { $ne: this._id },
      status: "published",
      publishedAt: { $lte: new Date() },
      $or: [
        { category: this.category },
        { tags: { $in: this.tags } },
        { targetAudience: { $in: this.targetAudience } },
      ],
    })
    .populate("author", "firstName lastName avatar")
    .sort({ publishedAt: -1 })
    .limit(limit);

  return relatedPosts;
};

// Method to generate excerpt from content if not provided
blogSchema.methods.generateExcerpt = function (length = 160) {
  if (this.excerpt) return this.excerpt;
  
  const cleanContent = this.content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  
  return cleanContent.length > length
    ? cleanContent.substring(0, length) + "..."
    : cleanContent;
};

module.exports = mongoose.model("Blog", blogSchema);