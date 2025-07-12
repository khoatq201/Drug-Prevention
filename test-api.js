const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSoftDelete() {
  try {
    console.log('🚀 Testing Soft Delete API...\n');

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@drugprevention.com",
      password: "admin123"
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get all courses
    console.log('2. Getting all courses...');
    const coursesResponse = await axios.get(`${API_BASE}/courses/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const courses = coursesResponse.data.data;
    console.log(`✅ Found ${courses.length} courses`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found to test');
      return;
    }

    const firstCourse = courses[0];
    console.log(`📝 Testing with course: ${firstCourse.title} (ID: ${firstCourse._id})\n`);

    // 3. Soft delete course
    console.log('3. Soft deleting course...');
    await axios.delete(`${API_BASE}/courses/${firstCourse._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Course soft deleted\n');

    // 4. Try to get course normally (should not find)
    console.log('4. Trying to get course normally...');
    try {
      await axios.get(`${API_BASE}/courses/${firstCourse._id}`);
      console.log('❌ Course should not be accessible normally');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Course correctly hidden from normal access');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // 5. Get course as admin with archived included
    console.log('\n5. Getting course as admin with archived included...');
    const archivedResponse = await axios.get(`${API_BASE}/courses/${firstCourse._id}?includeArchived=true`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin can access archived course');
    console.log(`📝 Course status: ${archivedResponse.data.data.status}\n`);

    // 6. Restore course
    console.log('6. Restoring course...');
    await axios.patch(`${API_BASE}/courses/${firstCourse._id}/restore`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Course restored\n');

    // 7. Verify course is accessible again
    console.log('7. Verifying course is accessible again...');
    const restoredResponse = await axios.get(`${API_BASE}/courses/${firstCourse._id}`);
    console.log('✅ Course accessible after restore');
    console.log(`📝 Course status: ${restoredResponse.data.data.status}\n`);

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run test
testSoftDelete();
