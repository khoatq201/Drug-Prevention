# Phần mềm Hỗ trợ Phòng ngừa Sử dụng Ma túy trong Cộng đồng

Một nền tảng tổng hợp giúp nâng cao nhận thức, đánh giá rủi ro và cung cấp hỗ trợ chuyên nghiệp về phòng chống ma túy cho cộng đồng.

## 🌟 Tính năng chính

### 🎓 Khóa học đào tạo online

- Các khóa học về nhận thức ma túy, kỹ năng phòng tránh, kỹ năng từ chối
- Nội dung được phân theo độ tuổi (học sinh, sinh viên, phụ huynh, giáo viên)
- Hệ thống theo dõi tiến độ và cấp chứng chỉ

### 📋 Đánh giá rủi ro

- Các bài khảo sát trắc nghiệm ASSIST, CRAFFT
- Xác định mức độ nguy cơ sử dụng ma túy
- Đề xuất hành động phù hợp dựa trên kết quả

### 📅 Đặt lịch hẹn trực tuyến

- Đặt lịch với chuyên viên tư vấn
- Quản lý lịch làm việc của counselor
- Hệ thống nhắc nhở và thông báo

### 🏛️ Quản lý chương trình cộng đồng

- Các chương trình truyền thông và giáo dục
- Khảo sát trước/sau chương trình
- Theo dõi hiệu quả và cải tiến

### 👥 Quản lý người dùng

- Hồ sơ người dùng chi tiết
- Lịch sử tham gia khóa học và chương trình
- Dashboard cá nhân với thống kê

### 📊 Dashboard & Báo cáo

- Thống kê và phân tích dữ liệu
- Báo cáo hiệu quả chương trình
- Insights cho việc ra quyết định

## 🛠️ Công nghệ sử dụng

### Frontend

- **Framework**: Vite + React (JavaScript)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer

## 📁 Cấu trúc dự án

```
drug-prevention-platform/
├── frontend/                 # React Vite application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── ...
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js Express API
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js (v18 hoặc cao hơn)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

### 1. Clone repository

```bash
git clone <repository-url>
cd drug-prevention-platform
```

### 2. Cài đặt Backend

```bash
cd backend
npm install

# Tạo file .env và cấu hình
cp .env.example .env
# Chỉnh sửa file .env với thông tin database và JWT secret

# Chạy server development
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install

# Tạo file .env và cấu hình
cp .env.example .env
# Chỉnh sửa file .env với URL của backend API

# Chạy development server
npm run dev
```

### 4. Cài đặt MongoDB

- **Local**: Cài đặt MongoDB Community Server
- **Cloud**: Sử dụng MongoDB Atlas (khuyến nghị)

## 🔧 Cấu hình Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drug_prevention
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Phòng chống Ma túy Cộng đồng
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu

### Courses Endpoints

- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Lấy chi tiết khóa học
- `POST /api/courses/:id/enroll` - Đăng ký khóa học

### Assessments Endpoints

- `GET /api/assessments` - Lấy danh sách bài đánh giá
- `POST /api/assessments/:id/take` - Thực hiện bài đánh giá
- `GET /api/assessments/results/:userId` - Lấy kết quả đánh giá

### Appointments Endpoints

- `GET /api/appointments` - Lấy danh sách lịch hẹn
- `POST /api/appointments` - Tạo lịch hẹn mới
- `PUT /api/appointments/:id` - Cập nhật lịch hẹn

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Build và deploy lên server (Heroku, DigitalOcean, AWS, etc.)
2. Cài đặt MongoDB Atlas cho production
3. Cấu hình environment variables trên server

### Frontend Deployment

1. Build production version

```bash
cd frontend
npm run build
```

2. Deploy lên static hosting (Vercel, Netlify, etc.)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- **Tổ chức**: Tổ chức Phòng chống Ma túy Cộng đồng
- **Email**: contact@drugprevention.org
- **Phone**: +84-123-456-789

## 🆘 Đường dây khẩn cấp

- **Đường dây nóng phòng chống tệ nạn xã hội**: 1800-1567
- **Trung tâm Chống độc 115**: 115
- **Cơ quan công an**: 113

---

**Lưu ý quan trọng**: Nếu bạn hoặc người thân đang trong tình trạng khẩn cấp do sử dụng chất kích thích, hãy gọi ngay số điện thoại khẩn cấp.
