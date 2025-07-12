const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

async function checkBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const count = await Blog.countDocuments();
    console.log('Total blogs:', count);
    
    const blogs = await Blog.find().select('title status slug');
    blogs.forEach((blog, i) => {
      console.log(`${i+1}. ${blog.title} (${blog.status}) - Slug: ${blog.slug}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkBlogs(); 