const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const User = require("../models/User");
const Course = require("../models/Course");
const Blog = require("../models/Blog");
const Counselor = require("../models/Counselor");

// Blog data
const blogData = [
  {
    title: "Tác hại của ma túy đối với sức khỏe tâm thần",
    slug: "tac-hai-cua-ma-tuy-doi-voi-suc-khoe-tam-than",
    content: `
# Tác hại của ma túy đối với sức khỏe tâm thần

Ma túy không chỉ gây hại cho sức khỏe thể chất mà còn có những tác động nghiêm trọng đến sức khỏe tâm thần của người sử dụng.

## Các tác hại chính

### 1. Rối loạn tâm lý
- Trầm cảm, lo âu
- Hoang tưởng, ảo giác
- Rối loạn nhân cách

### 2. Suy giảm chức năng nhận thức
- Giảm trí nhớ
- Khó tập trung
- Suy giảm khả năng ra quyết định

### 3. Hành vi bạo lực và tự hủy hoại
- Tăng nguy cơ tự tử
- Hành vi bạo lực
- Tự làm tổn hại bản thân

## Cách phòng ngừa

1. Giáo dục về tác hại của ma túy
2. Xây dựng lối sống lành mạnh
3. Tìm kiếm sự hỗ trợ từ chuyên gia
4. Tham gia các hoạt động tích cực

**Lưu ý**: Nếu bạn hoặc người thân đang gặp vấn đề với ma túy, hãy liên hệ ngay với các chuyên gia để được hỗ trợ kịp thời.
    `,
    excerpt:
      "Ma túy có những tác động nghiêm trọng đến sức khỏe tâm thần, gây ra nhiều rối loạn tâm lý và hành vi nguy hiểm.",
    category: "health",
    tags: ["ma túy", "sức khỏe tâm thần", "phòng ngừa", "tác hại"],
    featured: true,
    status: "published",
    publishedAt: new Date(),
    readTime: 8,
    language: "en",
  },
  {
    title: "Làm thế nào để từ chối ma túy một cách hiệu quả",
    slug: "lam-the-nao-de-tu-choi-ma-tuy-mot-cach-hieu-qua",
    content: `
# Làm thế nào để từ chối ma túy một cách hiệu quả

Việc từ chối ma túy đôi khi không dễ dàng, đặc biệt khi áp lực từ bạn bè hoặc môi trường xung quanh. Dưới đây là những cách hiệu quả để nói "KHÔNG" với ma túy.

## Các chiến lược từ chối

### 1. Chuẩn bị tâm lý
- Xác định rõ lý do tại sao bạn không sử dụng ma túy
- Luyện tập các câu từ chối trước
- Tin tưởng vào quyết định của mình

### 2. Cách từ chối trực tiếp
- "Không, cảm ơn"
- "Tôi không quan tâm"
- "Điều đó không phù hợp với tôi"

### 3. Đưa ra lý do
- "Tôi phải lái xe về nhà"
- "Tôi đang dùng thuốc không được mix"
- "Tôi có trận đấu/kỳ thi quan trọng"

### 4. Đề xuất thay thế
- Đề xuất hoạt động khác
- Rủ đi ăn hoặc xem phim
- Tham gia hoạt động thể thao

## Khi nào cần tránh xa

Nếu bạn thường xuyên bị áp lực sử dụng ma túy, hãy cân nhắc:
- Thay đổi nhóm bạn
- Tránh những nơi có ma túy
- Tìm kiếm sự hỗ trợ từ gia đình, bạn bè tin cậy

**Nhớ rằng**: Sức khỏe và tương lai của bạn quan trọng hơn việc làm hài lòng người khác.
    `,
    excerpt:
      "Hướng dẫn các chiến lược hiệu quả để từ chối ma túy và bảo vệ bản thân khỏi áp lực xã hội.",
    category: "prevention",
    tags: ["từ chối ma túy", "áp lực bạn bè", "kỹ năng sống", "tự bảo vệ"],
    featured: false,
    status: "published",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    readTime: 6,
    language: "en",
  },
  {
    title: "Vai trò của gia đình trong phòng chống ma túy",
    slug: "vai-tro-cua-gia-dinh-trong-phong-chong-ma-tuy",
    content: `
# Vai trò của gia đình trong phòng chống ma túy

Gia đình đóng vai trò quan trọng nhất trong việc phòng ngừa và hỗ trợ người thân tránh xa ma túy.

## Vai trò phòng ngừa

### 1. Giáo dục sớm
- Nói chuyện về tác hại của ma túy từ sớm
- Giải thích một cách phù hợp với độ tuổi
- Tạo môi trường để con em có thể hỏi và chia sẻ

### 2. Xây dựng mối quan hệ tốt
- Dành thời gian chất lượng cho gia đình
- Lắng nghe và thấu hiểu
- Tạo sự tin tưởng và an toàn

### 3. Làm gương tích cực
- Có lối sống lành mạnh
- Không sử dụng chất kích thích có hại
- Thể hiện cách giải quyết stress tích cực

## Khi có dấu hiệu cảnh báo

### Dấu hiệu cần chú ý:
- Thay đổi hành vi đột ngột
- Thành tích học tập giảm sút
- Thay đổi nhóm bạn
- Che giấu hoạt động
- Các vấn đề về sức khỏe

### Cách xử lý:
1. Giữ bình tĩnh và không phán xét
2. Nói chuyện một cách cởi mở
3. Tìm hiểu nguyên nhân
4. Tìm kiếm sự hỗ trợ chuyên nghiệp
5. Đồng hành và ủng hộ

## Lời khuyên cho phụ huynh

- Tạo môi trường gia đình ấm áp, tin cậy
- Quan tâm đến hoạt động hàng ngày của con
- Không quá khắt khe nhưng cũng không quá buông lỏng
- Khen ngợi những hành vi tích cực
- Tìm hiểu về ma túy để có thể tư vấn đúng cách

**Nhớ rằng**: Tình yêu thương và sự ủng hộ từ gia đình là sức mạnh lớn nhất giúp con em tránh xa ma túy.
    `,
    excerpt:
      "Gia đình là tuyến phòng thủ đầu tiên và quan trọng nhất trong cuộc chiến chống ma túy.",
    category: "family",
    tags: ["gia đình", "phòng ngừa", "giáo dục", "hỗ trợ"],
    featured: true,
    status: "published",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    readTime: 10,
    language: "en",
  },
  {
    title: "Các hoạt động thể thao giúp phòng chống ma túy",
    slug: "cac-hoat-dong-the-thao-giup-phong-chong-ma-tuy",
    content: `
# Các hoạt động thể thao giúp phòng chống ma túy

Thể thao không chỉ giúp rèn luyện sức khỏe mà còn là công cụ hiệu quả trong việc phòng chống ma túy.

## Lợi ích của thể thao

### 1. Cải thiện sức khỏe tâm thần
- Giảm stress và lo âu
- Tăng cường hormone hạnh phúc (endorphin)
- Cải thiện tâm trạng và tự tin

### 2. Xây dựng kỷ luật
- Rèn luyện ý chí
- Tạo thói quen tích cực
- Học cách đặt mục tiêu và kiên trì

### 3. Mở rộng quan hệ xã hội tích cực
- Kết nối với những người có chung sở thích lành mạnh
- Tránh xa môi trường tiêu cực
- Tham gia cộng đồng tích cực

## Các môn thể thao phù hợp

### Thể thao cá nhân:
- **Chạy bộ**: Dễ thực hiện, ít tốn kém
- **Bơi lội**: Rèn luyện toàn thân
- **Yoga**: Cải thiện sức khỏe tâm thần
- **Gym**: Tăng cường sức mạnh

### Thể thao đồng đội:
- **Bóng đá**: Phát triển tinh thần đồng đội
- **Bóng rổ**: Tăng cường phản xạ
- **Cầu lông**: Dễ tiếp cận
- **Bóng chuyền**: Rèn luyện sự phối hợp

## Cách bắt đầu

1. **Chọn môn phù hợp**: Dựa vào sở thích và khả năng
2. **Bắt đầu từ từ**: Không nên quá sức ngay từ đầu
3. **Tìm bạn đồng hành**: Tạo động lực và duy trì
4. **Đặt mục tiêu rõ ràng**: Có kế hoạch cụ thể
5. **Kiên trì**: Duy trì đều đặn để có hiệu quả

## Chương trình thể thao phòng chống ma túy

### Tuần 1-2: Làm quen
- 3 buổi/tuần, mỗi buổi 30 phút
- Tập nhẹ nhàng, làm quen với chuyển động

### Tuần 3-4: Tăng cường
- 4 buổi/tuần, mỗi buổi 45 phút
- Tăng cường độ và thời gian

### Từ tuần 5: Duy trì
- 4-5 buổi/tuần
- Kết hợp nhiều môn khác nhau
- Tham gia các giải đấu nhỏ

**Lưu ý**: Thể thao là cách tự nhiên và hiệu quả để thay thế những cảm giác "phê" có hại bằng những cảm giác tích cực từ vận động.
    `,
    excerpt:
      "Khám phá cách thể thao có thể trở thành công cụ mạnh mẽ trong việc phòng chống ma túy và xây dựng lối sống lành mạnh.",
    category: "community",
    tags: ["thể thao", "lối sống lành mạnh", "phòng ngừa", "sức khỏe"],
    featured: false,
    status: "published",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    readTime: 12,
    language: "en",
  },
];

// Course data
const courseData = [
  {
    title: "Hiểu biết cơ bản về ma túy và tác hại",
    description:
      "Khóa học cung cấp kiến thức toàn diện về các loại ma túy, tác hại đối với sức khỏe và xã hội.",
    level: "beginner",
    duration: 240, // 4 hours
    price: 0,
    category: "drug_awareness",
    targetAgeGroup: ["student", "university_student", "parent", "teacher"],
    isPublished: true,
    featured: true,
    enrollment: {
      isOpen: true,
      capacity: 100,
      enrolled: 0,
    },
    modules: [
      {
        title: "Giới thiệu về ma túy",
        description: "Khái niệm, phân loại và lịch sử ma túy",
        duration: 60,
        order: 1,
        lessons: [
          {
            title: "Ma túy là gì?",
            content: "<h2>Định nghĩa</h2><p>Ma túy là các chất tự nhiên hoặc tổng hợp, khi đưa vào cơ thể sẽ ảnh hưởng đến hệ thần kinh trung ương và gây nghiện.</p>",
            type: "video",
            duration: 15,
            order: 1,
            videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            resources: [
              { title: "Tài liệu tham khảo về ma túy", url: "https://example.com/docs/drug-basics.pdf", type: "pdf" }
            ]
          },
          {
            title: "Phân loại ma túy",
            content: "<h2>Phân loại ma túy</h2><ul><li>Ma túy tự nhiên</li><li>Ma túy tổng hợp</li><li>Ma túy bán tổng hợp</li></ul>",
            type: "text",
            duration: 20,
            order: 2,
            videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            resources: [
              { title: "Bảng phân loại ma túy chi tiết", url: "https://example.com/docs/drug-classification.pdf", type: "pdf" }
            ]
          },
          {
            title: "Lịch sử và tình hình hiện tại",
            content: "<h2>Lịch sử và tình hình hiện tại</h2><p>Ma túy đã xuất hiện từ lâu đời và có nhiều biến động trong xã hội hiện đại.</p>",
            type: "video",
            duration: 25,
            order: 3,
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            resources: []
          }
        ]
      },
      {
        title: "Tác hại của ma túy",
        description: "Những tác động tiêu cực đối với cá nhân và xã hội",
        duration: 90,
        order: 2,
        lessons: [
          {
            title: "Tác hại đối với sức khỏe thể chất",
            content: "<h2>Tác hại đối với sức khỏe thể chất</h2><p>Ma túy gây ra nhiều vấn đề về sức khỏe như suy giảm trí nhớ, rối loạn tâm thần, và các bệnh lý khác.</p>",
            type: "video",
            duration: 30,
            order: 1,
            videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
            resources: [
              { title: "Nghiên cứu về tác hại của ma túy", url: "https://example.com/docs/drug-effects.pdf", type: "pdf" }
            ]
          },
          {
            title: "Tác hại đối với sức khỏe tâm thần",
            content: "<h2>Tác hại đối với sức khỏe tâm thần</h2><p>Người sử dụng ma túy có nguy cơ cao mắc các rối loạn tâm thần như trầm cảm, lo âu, hoang tưởng.</p>",
            type: "text",
            duration: 30,
            order: 2,
            videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            resources: []
          },
          {
            title: "Tác động xã hội",
            content: "<h2>Tác động xã hội</h2><p>Ma túy không chỉ ảnh hưởng đến cá nhân mà còn gây ra nhiều hệ lụy cho gia đình và xã hội.</p>",
            type: "video",
            duration: 30,
            order: 3,
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
            resources: []
          }
        ]
      },
      {
        title: "Các yếu tố nguy cơ",
        description: "Nhận biết các yếu tố có thể dẫn đến sử dụng ma túy",
        duration: 60,
        order: 3,
        lessons: [
          {
            title: "Yếu tố cá nhân",
            content: "Những đặc điểm cá nhân làm tăng nguy cơ...",
            type: "text",
            duration: 20,
            order: 1,
          },
          {
            title: "Yếu tố môi trường",
            content: "Ảnh hưởng của môi trường sống...",
            type: "video",
            duration: 20,
            order: 2,
          },
          {
            title: "Áp lực xã hội",
            content: "Tác động của áp lực từ bạn bè và xã hội...",
            type: "text",
            duration: 20,
            order: 3,
          },
        ],
      },
      {
        title: "Phòng ngừa và bảo vệ bản thân",
        description: "Các biện pháp phòng ngừa hiệu quả",
        duration: 30,
        order: 4,
        lessons: [
          {
            title: "Kỹ năng từ chối",
            content: "Cách nói không với ma túy...",
            type: "video",
            duration: 15,
            order: 1,
          },
          {
            title: "Xây dựng lối sống lành mạnh",
            content: "Những thói quen tích cực...",
            type: "text",
            duration: 15,
            order: 2,
          },
        ],
      },
    ],
    requirements: ["Không có yêu cầu tiên quyết"],
    whatYouWillLearn: [
      "Hiểu rõ về các loại ma túy và tác hại",
      "Nhận biết các yếu tố nguy cơ",
      "Kỹ năng phòng ngừa và tự bảo vệ",
      "Cách xây dựng lối sống lành mạnh",
    ],
    language: "en",
    certificateAwarded: true,
  },
  {
    title: "Kỹ năng tư vấn và hỗ trợ người nghiện",
    description:
      "Khóa học dành cho những người muốn hỗ trợ người thân hoặc bạn bè có vấn đề với ma túy.",
    level: "intermediate",
    duration: 360, // 6 hours
    price: 0,
    category: "counseling",
    targetAgeGroup: ["parent", "teacher", "other"],
    isPublished: true,
    featured: true,
    enrollment: {
      isOpen: true,
      capacity: 50,
      enrolled: 0,
    },
    modules: [
      {
        title: "Hiểu về nghiện ma túy",
        description: "Bản chất của nghiện và quá trình hình thành",
        duration: 90,
        order: 1,
        lessons: [
          {
            title: "Nghiện là gì?",
            content: "Định nghĩa và cơ chế hình thành nghiện...",
            type: "video",
            duration: 30,
            order: 1,
          },
          {
            title: "Các giai đoạn của nghiện",
            content: "Từ thử nghiệm đến nghiện nặng...",
            type: "text",
            duration: 30,
            order: 2,
          },
          {
            title: "Dấu hiệu nhận biết",
            content: "Cách phát hiện sớm vấn đề nghiện...",
            type: "video",
            duration: 30,
            order: 3,
          },
        ],
      },
      {
        title: "Kỹ năng giao tiếp",
        description: "Cách nói chuyện hiệu quả với người có vấn đề ma túy",
        duration: 120,
        order: 2,
        lessons: [
          {
            title: "Lắng nghe không phán xét",
            content: "Kỹ năng lắng nghe tích cực...",
            type: "video",
            duration: 40,
            order: 1,
          },
          {
            title: "Cách đặt câu hỏi",
            content: "Đặt câu hỏi mở để hiểu rõ vấn đề...",
            type: "text",
            duration: 40,
            order: 2,
          },
          {
            title: "Xử lý các tình huống khó khăn",
            content: "Đối phó với sự chối bỏ và tức giận...",
            type: "video",
            duration: 40,
            order: 3,
          },
        ],
      },
      {
        title: "Các phương pháp hỗ trợ",
        description: "Những cách tiếp cận để giúp đỡ người nghiện",
        duration: 90,
        order: 3,
        lessons: [
          {
            title: "Can thiệp động lực",
            content: "Kỹ thuật tăng cường động lực thay đổi...",
            type: "video",
            duration: 45,
            order: 1,
          },
          {
            title: "Hỗ trợ gia đình",
            content: "Cách toàn gia đình cùng tham gia...",
            type: "text",
            duration: 45,
            order: 2,
          },
        ],
      },
      {
        title: "Chăm sóc bản thân",
        description: "Tự chăm sóc khi hỗ trợ người khác",
        duration: 60,
        order: 4,
        lessons: [
          {
            title: "Quản lý stress",
            content: "Cách xử lý áp lực khi giúp đỡ người khác...",
            type: "video",
            duration: 30,
            order: 1,
          },
          {
            title: "Tìm kiếm hỗ trợ",
            content: "Khi nào cần sự giúp đỡ chuyên nghiệp...",
            type: "text",
            duration: 30,
            order: 2,
          },
        ],
      },
    ],
    requirements: [
      "Hoàn thành khóa học cơ bản",
      "Có kinh nghiệm làm việc với người có vấn đề",
    ],
    whatYouWillLearn: [
      "Hiểu sâu về bản chất của nghiện",
      "Kỹ năng giao tiếp hiệu quả",
      "Phương pháp can thiệp và hỗ trợ",
      "Cách chăm sóc bản thân trong quá trình hỗ trợ",
    ],
    language: "en",
    certificateAwarded: true,
  },
  {
    title: "Phòng ngừa ma túy trong môi trường học đường",
    description:
      "Khóa học chuyên biệt dành cho giáo viên và nhân viên giáo dục.",
    level: "intermediate",
    duration: 300, // 5 hours
    price: 0,
    category: "prevention_skills",
    targetAgeGroup: ["teacher"],
    isPublished: true,
    featured: false,
    enrollment: {
      isOpen: true,
      capacity: 30,
      enrolled: 0,
    },
    modules: [
      {
        title: "Tình hình ma túy trong học đường",
        description: "Hiện trạng và thách thức hiện tại",
        duration: 75,
        order: 1,
        lessons: [
          {
            title: "Thống kê và số liệu",
            content: "Tình hình sử dụng ma túy ở học sinh, sinh viên...",
            type: "text",
            duration: 25,
            order: 1,
          },
          {
            title: "Các yếu tố nguy cơ trong trường học",
            content: "Những điều kiện thuận lợi cho ma túy...",
            type: "video",
            duration: 25,
            order: 2,
          },
          {
            title: "Dấu hiệu cảnh báo",
            content: "Nhận biết học sinh có vấn đề...",
            type: "text",
            duration: 25,
            order: 3,
          },
        ],
      },
      {
        title: "Xây dựng chương trình phòng ngừa",
        description: "Thiết kế các hoạt động giáo dục phòng ngừa",
        duration: 120,
        order: 2,
        lessons: [
          {
            title: "Nguyên tắc giáo dục phòng ngừa",
            content: "Các nguyên tắc cơ bản khi thiết kế chương trình...",
            type: "video",
            duration: 40,
            order: 1,
          },
          {
            title: "Phương pháp giảng dạy hiệu quả",
            content: "Kỹ thuật truyền đạt thông tin hấp dẫn...",
            type: "text",
            duration: 40,
            order: 2,
          },
          {
            title: "Thiết kế hoạt động thực hành",
            content: "Các trò chơi và bài tập tương tác...",
            type: "video",
            duration: 40,
            order: 3,
          },
        ],
      },
      {
        title: "Xử lý các tình huống khó khăn",
        description: "Ứng phó khi phát hiện học sinh sử dụng ma túy",
        duration: 75,
        order: 3,
        lessons: [
          {
            title: "Quy trình xử lý",
            content: "Các bước cần thực hiện khi phát hiện vấn đề...",
            type: "text",
            duration: 25,
            order: 1,
          },
          {
            title: "Làm việc với gia đình",
            content: "Cách trao đổi với phụ huynh...",
            type: "video",
            duration: 25,
            order: 2,
          },
          {
            title: "Phối hợp với chuyên gia",
            content: "Khi nào cần chuyển gửi...",
            type: "text",
            duration: 25,
            order: 3,
          },
        ],
      },
      {
        title: "Xây dựng môi trường tích cực",
        description: "Tạo không gian an toàn và hỗ trợ",
        duration: 30,
        order: 4,
        lessons: [
          {
            title: "Văn hóa trường học tích cực",
            content: "Xây dựng môi trường không khoan nhượng với ma túy...",
            type: "video",
            duration: 15,
            order: 1,
          },
          {
            title: "Hoạt động ngoại khóa",
            content: "Tổ chức các hoạt động lành mạnh...",
            type: "text",
            duration: 15,
            order: 2,
          },
        ],
      },
    ],
    requirements: [
      "Là giáo viên hoặc nhân viên giáo dục",
      "Có hiểu biết cơ bản về ma túy",
    ],
    whatYouWillLearn: [
      "Hiểu rõ tình hình ma túy trong học đường",
      "Thiết kế chương trình giáo dục hiệu quả",
      "Xử lý các tình huống khó khăn",
      "Xây dựng môi trường học tập tích cực",
    ],
    language: "en",
    certificateAwarded: true,
  },
];

// Counselor data
const counselorData = [
  {
    firstName: "Dr. Nguyễn",
    lastName: "Thị Lan",
    email: "dr.lan@drugprevention.com",
    password: "counselor123",
    phone: "0901234567",
    role: "consultant",
    ageGroup: "other",
    specializations: [
      "addiction_counseling",
      "cognitive_behavioral",
      "family_therapy",
    ],
    experience: 8,
    education: [
      {
        degree: "Tiến sĩ Tâm lý học",
        institution: "Đại học Quốc gia Hà Nội",
        year: 2015,
      },
      {
        degree: "Thạc sĩ Tâm lý lâm sàng",
        institution: "Đại học Y Hà Nội",
        year: 2012,
      },
    ],
    certifications: [
      {
        name: "Chứng chỉ tư vấn nghiện chất",
        issuedBy: "Bộ Y tế",
        issuedDate: new Date("2018-05-15"),
        expiryDate: new Date("2025-05-15"),
      },
    ],
    bio: "Tiến sĩ Lan có hơn 8 năm kinh nghiệm trong lĩnh vực tư vấn và điều trị nghiện chất. Bà chuyên về liệu pháp nhận thức hành vi và đã giúp đỡ hàng trăm bệnh nhân vượt qua vấn đề nghiện.",
    expertise: ["Nghiện chất", "Rối loạn lo âu", "Trầm cảm", "Tư vấn gia đình"],
    languages: [
      { language: "vi", proficiency: "native" },
      { language: "en", proficiency: "advanced" },
    ],
    clientTypes: ["individual", "family", "adults"],
    availability: {
      monday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      tuesday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      wednesday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      thursday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      friday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      saturday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
        ],
      },
      sunday: { available: false, timeSlots: [] },
    },
    sessionTypes: [
      { type: "individual", duration: 60, price: 700000 },
      { type: "family", duration: 90, price: 900000 },
    ],
    fees: {
      online: 500000,
      inPerson: 700000,
    },
    isActive: true,
    isVerified: true,
    rating: 4.8,
    totalConsultations: 156,
    profileImage: "",
    officeAddress: "123 Đường Láng, Đống Đa, Hà Nội",
  },
  {
    firstName: "TS. Trần",
    lastName: "Minh Hoàng",
    email: "ts.hoang@drugprevention.com",
    password: "counselor123",
    phone: "0907654321",
    role: "consultant",
    ageGroup: "other",
    specializations: [
      "addiction_counseling",
      "trauma_therapy",
      "crisis_intervention",
      "recovery_coaching",
    ],
    experience: 12,
    education: [
      {
        degree: "Tiến sĩ Y khoa",
        institution: "Đại học Y Hồ Chí Minh",
        year: 2010,
      },
      {
        degree: "Chuyên khoa II Tâm thần",
        institution: "Bệnh viện Tâm thần Trung ương",
        year: 2014,
      },
    ],
    certifications: [
      {
        name: "Chứng chỉ điều trị nghiện quốc tế",
        issuedBy: "WHO",
        issuedDate: new Date("2016-03-20"),
        expiryDate: new Date("2026-03-20"),
      },
    ],
    bio: "Tiến sĩ Hoàng là bác sĩ chuyên khoa tâm thần với 12 năm kinh nghiệm điều trị nghiện chất. Ông đã tham gia nhiều chương trình cộng đồng và nghiên cứu về phòng chống ma túy.",
    expertise: [
      "Điều trị nghiện",
      "Rối loạn tâm thần",
      "Tư vấn cai nghiện",
      "Phục hồi chức năng",
    ],
    languages: [
      { language: "vi", proficiency: "native" },
      { language: "en", proficiency: "advanced" },
      { language: "fr", proficiency: "intermediate" },
    ],
    clientTypes: ["individual", "group", "adults"],
    availability: {
      monday: {
        available: true,
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "15:00", end: "16:00" },
          { start: "16:00", end: "17:00" },
        ],
      },
      tuesday: {
        available: true,
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "15:00", end: "16:00" },
          { start: "16:00", end: "17:00" },
        ],
      },
      wednesday: { available: false, timeSlots: [] },
      thursday: {
        available: true,
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "15:00", end: "16:00" },
          { start: "16:00", end: "17:00" },
        ],
      },
      friday: {
        available: true,
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "15:00", end: "16:00" },
          { start: "16:00", end: "17:00" },
        ],
      },
      saturday: {
        available: true,
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
        ],
      },
      sunday: { available: false, timeSlots: [] },
    },
    sessionTypes: [
      { type: "individual", duration: 60, price: 800000 },
      { type: "group", duration: 90, price: 1200000 },
    ],
    fees: {
      online: 600000,
      inPerson: 800000,
    },
    isActive: true,
    isVerified: true,
    rating: 4.9,
    totalConsultations: 234,
    profileImage: "",
    officeAddress: "456 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
  },
  {
    firstName: "ThS. Lê",
    lastName: "Thị Mai",
    email: "ths.mai@drugprevention.com",
    password: "counselor123",
    phone: "0909876543",
    role: "consultant",
    ageGroup: "other",
    specializations: [
      "family_therapy",
      "youth_counseling",
      "prevention_education",
      "motivational_interviewing",
    ],
    experience: 6,
    education: [
      {
        degree: "Thạc sĩ Tâm lý học Ứng dụng",
        institution: "Đại học Sư phạm Hà Nội",
        year: 2018,
      },
      {
        degree: "Cử nhân Tâm lý học",
        institution: "Đại học Khoa học Xã hội và Nhân văn",
        year: 2015,
      },
    ],
    certifications: [
      {
        name: "Chứng chỉ tư vấn gia đình",
        issuedBy: "Hiệp hội Tâm lý Việt Nam",
        issuedDate: new Date("2019-08-10"),
        expiryDate: new Date("2024-08-10"),
      },
    ],
    bio: "Thạc sĩ Mai chuyên về tư vấn gia đình và hỗ trợ thanh thiếu niên. Cô có kinh nghiệm làm việc với các gia đình có con em gặp vấn đề về ma túy và rối loạn hành vi.",
    expertise: [
      "Tư vấn gia đình",
      "Tâm lý thanh thiếu niên",
      "Kỹ năng sống",
      "Phòng ngừa nghiện",
    ],
    languages: [
      { language: "vi", proficiency: "native" },
      { language: "en", proficiency: "intermediate" },
    ],
    clientTypes: ["family", "children", "adolescents"],
    availability: {
      monday: {
        available: true,
        timeSlots: [
          { start: "07:00", end: "08:00" },
          { start: "08:00", end: "09:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
        ],
      },
      tuesday: {
        available: true,
        timeSlots: [
          { start: "07:00", end: "08:00" },
          { start: "08:00", end: "09:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
        ],
      },
      wednesday: {
        available: true,
        timeSlots: [
          { start: "07:00", end: "08:00" },
          { start: "08:00", end: "09:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
        ],
      },
      thursday: {
        available: true,
        timeSlots: [
          { start: "07:00", end: "08:00" },
          { start: "08:00", end: "09:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
        ],
      },
      friday: {
        available: true,
        timeSlots: [
          { start: "07:00", end: "08:00" },
          { start: "08:00", end: "09:00" },
          { start: "18:00", end: "19:00" },
          { start: "19:00", end: "20:00" },
          { start: "20:00", end: "21:00" },
        ],
      },
      saturday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
      sunday: {
        available: true,
        timeSlots: [
          { start: "08:00", end: "09:00" },
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:00", end: "16:00" },
        ],
      },
    },
    sessionTypes: [
      { type: "family", duration: 90, price: 600000 },
      { type: "individual", duration: 60, price: 600000 },
    ],
    fees: {
      online: 400000,
      inPerson: 600000,
    },
    isActive: true,
    isVerified: true,
    rating: 4.7,
    totalConsultations: 89,
    profileImage: "",
    officeAddress: "789 Hoàng Văn Thụ, Phú Nhuận, TP.HCM",
  },
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/drug_prevention"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Seed functions
const seedBlogs = async () => {
  try {
    console.log("Seeding blogs...");

    // Clear existing blogs
    await Blog.deleteMany({});

    // Create sample author (admin user)
    let author = await User.findOne({ role: "admin" });
    if (!author) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      author = await User.create({
        firstName: "Admin",
        lastName: "System",
        email: "admin@drugprevention.com",
        password: hashedPassword,
        role: "admin",
        ageGroup: "other",
        isEmailVerified: true,
      });
    }

    // Add author to blog data
    const blogsWithAuthor = blogData.map((blog) => ({
      ...blog,
      author: author._id,
    }));

    // Insert blogs one by one to avoid text index issues
    for (const blogData of blogsWithAuthor) {
      const blog = new Blog(blogData);
      await blog.save();
    }
    console.log(`✅ Created ${blogsWithAuthor.length} blogs`);
  } catch (error) {
    console.error("Error seeding blogs:", error);
  }
};

const seedCourses = async () => {
  try {
    console.log("Seeding courses...");

    // Clear existing courses
    await Course.deleteMany({});

    // Create sample instructor (admin user)
    let instructor = await User.findOne({ role: "admin" });
    if (!instructor) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      instructor = await User.create({
        firstName: "Instructor",
        lastName: "System",
        email: "instructor@drugprevention.com",
        password: hashedPassword,
        role: "admin",
        ageGroup: "other",
        isEmailVerified: true,
      });
    }

    // Add instructor to course data
    const coursesWithInstructor = courseData.map((course) => ({
      ...course,
      instructor: instructor._id,
    }));

    // Insert courses
    await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${coursesWithInstructor.length} courses`);
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
};

const seedCounselors = async () => {
  try {
    console.log("Seeding counselors...");

    // Clear existing counselors
    await Counselor.deleteMany({});
    await User.deleteMany({ role: "consultant" });

    // Create counselor users and counselor profiles
    for (const counselorInfo of counselorData) {
      // Create user first
      const hashedPassword = await bcrypt.hash(counselorInfo.password, 12);
      const userData = {
        firstName: counselorInfo.firstName,
        lastName: counselorInfo.lastName,
        email: counselorInfo.email,
        password: hashedPassword,
        phone: counselorInfo.phone,
        role: "consultant",
        ageGroup: counselorInfo.ageGroup,
        isEmailVerified: true,
        isActive: counselorInfo.isActive,
      };

      const user = await User.create(userData);

      // Create counselor profile
      const counselorProfile = {
        userId: user._id,
        credentials: counselorInfo.education
          .map((edu) => ({
            type: "degree",
            title: edu.degree,
            institution: edu.institution,
            year: edu.year,
            isActive: true,
          }))
          .concat(
            counselorInfo.certifications.map((cert) => ({
              type: "certificate",
              title: cert.name,
              institution: cert.issuedBy,
              year: cert.issuedDate.getFullYear(),
              expiryDate: cert.expiryDate,
              isActive: true,
            }))
          ),
        specializations: counselorInfo.specializations,
        experience: {
          totalYears: counselorInfo.experience,
          workHistory: [
            {
              organization: "Trung tâm Tư vấn Tâm lý",
              position: "Chuyên viên tư vấn",
              startDate: new Date(
                new Date().getFullYear() - counselorInfo.experience,
                0,
                1
              ),
              isCurrent: true,
              description: "Tư vấn và hỗ trợ người nghiện ma túy",
            },
          ],
        },
        biography: counselorInfo.bio,
        areasOfExpertise: counselorInfo.expertise,
        languages: counselorInfo.languages,
        clientTypes: counselorInfo.clientTypes,
        availability: {
          workingHours: {
            monday: {
              isAvailable: counselorInfo.availability.monday.available,
              slots: counselorInfo.availability.monday.timeSlots,
            },
            tuesday: {
              isAvailable: counselorInfo.availability.tuesday.available,
              slots: counselorInfo.availability.tuesday.timeSlots,
            },
            wednesday: {
              isAvailable: counselorInfo.availability.wednesday.available,
              slots: counselorInfo.availability.wednesday.timeSlots,
            },
            thursday: {
              isAvailable: counselorInfo.availability.thursday.available,
              slots: counselorInfo.availability.thursday.timeSlots,
            },
            friday: {
              isAvailable: counselorInfo.availability.friday.available,
              slots: counselorInfo.availability.friday.timeSlots,
            },
            saturday: {
              isAvailable: counselorInfo.availability.saturday.available,
              slots: counselorInfo.availability.saturday.timeSlots,
            },
            sunday: {
              isAvailable: counselorInfo.availability.sunday.available,
              slots: counselorInfo.availability.sunday.timeSlots,
            },
          },
        },
        sessionSettings: {
          sessionTypes: counselorInfo.sessionTypes.map((st) => ({
            type: st.type,
            duration: st.duration,
            price: st.price,
            isActive: true,
          })),
          defaultDuration: 60,
          breakBetweenSessions: 15,
          maxAppointmentsPerDay: 8,
          advanceBookingDays: 30,
        },
        performance: {
          totalSessions: counselorInfo.totalConsultations,
          averageRating: counselorInfo.rating,
          totalReviews: Math.floor(counselorInfo.totalConsultations * 0.7),
          completionRate: 95,
        },
        verificationStatus: {
          isVerified: counselorInfo.isVerified,
          verifiedAt: new Date(),
        },
        status: counselorInfo.isActive ? "active" : "inactive",
        settings: {
          isPublicProfile: true,
          allowOnlineConsultations: true,
          autoConfirmAppointments: false,
          sendReminders: true,
        },
      };

      await Counselor.create(counselorProfile);
    }

    console.log(`✅ Created ${counselorData.length} counselors with profiles`);
  } catch (error) {
    console.error("Error seeding counselors:", error);
  }
};

// Main seed function
const seedData = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting data seeding...");

    await seedBlogs();
    await seedCourses();
    await seedCounselors();

    console.log("🎉 Data seeding completed successfully!");
  } catch (error) {
    console.error("Error in seeding process:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from database");
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData, seedBlogs, seedCourses, seedCounselors };
