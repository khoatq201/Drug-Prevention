const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');
require('dotenv').config();

// Sample blog data
const sampleBlogs = [
  {
    title: 'Hiểu về ma túy và tác hại của chúng',
    slug: 'hieu-ve-ma-tuy-va-tac-hai-cua-chung',
    excerpt: 'Bài viết cung cấp thông tin chi tiết về các loại ma túy phổ biến và tác hại nghiêm trọng của chúng đối với sức khỏe và cuộc sống.',
    content: `Ma túy là một vấn đề nghiêm trọng trong xã hội hiện đại, đặc biệt là đối với giới trẻ. Việc hiểu rõ về ma túy và tác hại của chúng là bước đầu tiên quan trọng trong việc phòng chống.

## Các loại ma túy phổ biến

### 1. Ma túy tổng hợp
- Amphetamine và Methamphetamine
- MDMA (Ecstasy)
- Ketamine
- GHB

### 2. Ma túy tự nhiên
- Heroin
- Cocaine
- Marijuana
- Opium

## Tác hại của ma túy

### Tác hại về sức khỏe
- Tổn thương não bộ
- Suy giảm chức năng gan, thận
- Rối loạn tâm thần
- Nguy cơ lây nhiễm HIV/AIDS

### Tác hại về xã hội
- Phá vỡ gia đình
- Gây mất trật tự xã hội
- Tăng tỷ lệ tội phạm
- Gánh nặng kinh tế

## Dấu hiệu nhận biết người sử dụng ma túy

1. Thay đổi về thể chất
2. Thay đổi về hành vi
3. Thay đổi về tâm lý
4. Vấn đề về tài chính

Chúng ta cần cùng nhau hành động để bảo vệ thế hệ trẻ và xây dựng một tương lai tốt đẹp hơn.`,
    category: 'education',
    tags: ['ma túy', 'tác hại', 'sức khỏe', 'giáo dục'],
    targetAudience: ['student', 'university_student', 'parent', 'teacher'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      alt: 'Hiểu về ma túy và tác hại',
      caption: 'Hình ảnh minh họa về tác hại của ma túy'
    },
    seo: {
      metaTitle: 'Hiểu về ma túy và tác hại - Hướng dẫn toàn diện',
      metaDescription: 'Tìm hiểu chi tiết về các loại ma túy phổ biến và tác hại nghiêm trọng của chúng đối với sức khỏe và xã hội.',
      keywords: ['ma túy', 'tác hại ma túy', 'sức khỏe', 'giáo dục', 'phòng chống']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: true,
      isPinned: false
    },
    publishedAt: new Date('2024-01-15'),
    views: {
      count: 1250,
      uniqueViews: 980,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Phương pháp phòng chống ma túy hiệu quả trong trường học',
    slug: 'phuong-phap-phong-chong-ma-tuy-hieu-qua-trong-truong-hoc',
    excerpt: 'Hướng dẫn chi tiết các phương pháp phòng chống ma túy hiệu quả trong môi trường học đường.',
    content: `Trường học là nơi quan trọng để giáo dục và phòng chống ma túy cho học sinh. Việc áp dụng các phương pháp phòng chống hiệu quả là vô cùng cần thiết.

## Các phương pháp phòng chống ma túy trong trường học

### 1. Giáo dục và nâng cao nhận thức
- Tổ chức các buổi tuyên truyền định kỳ
- Lồng ghép nội dung phòng chống ma túy vào chương trình học
- Mời chuyên gia tư vấn đến trường
- Tổ chức các cuộc thi tìm hiểu về ma túy

### 2. Xây dựng môi trường lành mạnh
- Tăng cường hoạt động thể thao, văn hóa
- Tạo không gian giao lưu, chia sẻ
- Xây dựng mối quan hệ thân thiện giữa thầy cô và học sinh
- Phát hiện và hỗ trợ học sinh có nguy cơ

### 3. Phối hợp với gia đình và cộng đồng
- Tổ chức họp phụ huynh định kỳ
- Phối hợp với chính quyền địa phương
- Liên kết với các tổ chức phòng chống ma túy
- Xây dựng mạng lưới hỗ trợ

### 4. Giám sát và phát hiện sớm
- Thiết lập hệ thống báo cáo
- Đào tạo giáo viên nhận biết dấu hiệu
- Tổ chức kiểm tra định kỳ
- Xử lý kịp thời các trường hợp vi phạm

## Kết quả mong đợi

- Giảm tỷ lệ học sinh sử dụng ma túy
- Nâng cao nhận thức của cộng đồng
- Xây dựng môi trường học tập an toàn
- Tạo nền tảng cho sự phát triển bền vững

Việc phòng chống ma túy trong trường học cần sự tham gia của toàn bộ cộng đồng giáo dục.`,
    category: 'prevention',
    tags: ['phòng chống', 'trường học', 'giáo dục', 'học sinh'],
    targetAudience: ['student', 'teacher', 'parent'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=800',
      alt: 'Phòng chống ma túy trong trường học',
      caption: 'Học sinh tham gia hoạt động phòng chống ma túy'
    },
    seo: {
      metaTitle: 'Phương pháp phòng chống ma túy hiệu quả trong trường học',
      metaDescription: 'Hướng dẫn chi tiết các phương pháp phòng chống ma túy hiệu quả trong môi trường học đường.',
      keywords: ['phòng chống ma túy', 'trường học', 'giáo dục', 'học sinh', 'phương pháp']
    },
    settings: {
      allowComments: true,
      requireApproval: true,
      allowLikes: true,
      isFeatured: true,
      isPinned: true
    },
    publishedAt: new Date('2024-01-20'),
    views: {
      count: 2100,
      uniqueViews: 1650,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Câu chuyện thành công: Từ nghiện ma túy đến cuộc sống mới',
    slug: 'cau-chuyen-thanh-cong-tu-nghien-ma-tuy-den-cuoc-song-moi',
    excerpt: 'Chia sẻ câu chuyện cảm động về hành trình vượt qua nghiện ma túy và tìm lại cuộc sống ý nghĩa.',
    content: `Đây là câu chuyện có thật về anh Nguyễn Văn A (tên đã thay đổi để bảo vệ danh tính), một người đã từng nghiện ma túy trong 8 năm và đã thành công vượt qua để có cuộc sống mới.

## Hành trình vào bóng tối

Anh A bắt đầu sử dụng ma túy từ năm 18 tuổi, khi đang là sinh viên đại học. Ban đầu chỉ là thử nghiệm, nhưng dần dần anh bị cuốn vào vòng xoáy của ma túy.

"Tôi không nhận ra mình đang nghiện cho đến khi quá muộn. Ma túy đã lấy đi tất cả: sức khỏe, tiền bạc, gia đình và cả tương lai của tôi."

## Bước ngoặt cuộc đời

Sau 8 năm nghiện ngập, anh A đã có một bước ngoặt quan trọng khi mẹ anh qua đời vì bệnh tim. Cái chết của mẹ đã làm anh thức tỉnh.

"Tôi nhận ra rằng mình đã làm mẹ đau khổ quá nhiều. Tôi quyết định phải thay đổi, không chỉ vì mình mà còn vì mẹ."

## Hành trình phục hồi

### Giai đoạn 1: Thừa nhận vấn đề
- Tự nhận thức về tình trạng nghiện
- Tìm kiếm sự giúp đỡ từ gia đình
- Liên hệ với các trung tâm cai nghiện

### Giai đoạn 2: Cai nghiện
- Tham gia chương trình cai nghiện
- Hỗ trợ y tế và tâm lý
- Xây dựng lối sống mới

### Giai đoạn 3: Tái hòa nhập
- Học nghề mới
- Tìm việc làm
- Xây dựng mối quan hệ mới

## Cuộc sống hiện tại

Sau 3 năm cai nghiện thành công, anh A hiện đang:
- Làm việc tại một công ty công nghệ
- Có gia đình hạnh phúc
- Tham gia tình nguyện giúp đỡ người nghiện
- Chia sẻ kinh nghiệm với cộng đồng

## Bài học quý giá

"Tôi muốn chia sẻ với mọi người rằng không bao giờ là quá muộn để thay đổi. Ma túy có thể hủy hoại cuộc sống, nhưng với quyết tâm và sự hỗ trợ, chúng ta có thể vượt qua."

## Lời khuyên cho người đang nghiện

1. Thừa nhận vấn đề
2. Tìm kiếm sự giúp đỡ
3. Kiên trì trong quá trình cai nghiện
4. Xây dựng lối sống lành mạnh
5. Không bao giờ từ bỏ hy vọng

Câu chuyện của anh A là minh chứng cho thấy rằng với quyết tâm và sự hỗ trợ đúng đắn, mọi người đều có thể vượt qua nghiện ma túy và tìm lại cuộc sống ý nghĩa.`,
    category: 'success_stories',
    tags: ['câu chuyện thành công', 'cai nghiện', 'phục hồi', 'hy vọng'],
    targetAudience: ['general', 'parent', 'student'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      alt: 'Câu chuyện thành công',
      caption: 'Hành trình vượt qua nghiện ma túy'
    },
    seo: {
      metaTitle: 'Câu chuyện thành công: Từ nghiện ma túy đến cuộc sống mới',
      metaDescription: 'Chia sẻ câu chuyện cảm động về hành trình vượt qua nghiện ma túy và tìm lại cuộc sống ý nghĩa.',
      keywords: ['câu chuyện thành công', 'cai nghiện', 'phục hồi', 'hy vọng', 'ma túy']
    },
    settings: {
      allowComments: true,
      requireApproval: true,
      allowLikes: true,
      isFeatured: true,
      isPinned: false
    },
    publishedAt: new Date('2024-01-25'),
    views: {
      count: 3200,
      uniqueViews: 2800,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Vai trò của gia đình trong phòng chống ma túy',
    slug: 'vai-tro-cua-gia-dinh-trong-phong-chong-ma-tuy',
    excerpt: 'Gia đình đóng vai trò quan trọng trong việc phòng chống ma túy. Bài viết hướng dẫn cách gia đình có thể bảo vệ con em mình.',
    content: `Gia đình là nền tảng quan trọng nhất trong việc phòng chống ma túy. Cha mẹ và các thành viên gia đình có ảnh hưởng lớn đến việc hình thành nhân cách và lối sống của trẻ.

## Vai trò của gia đình

### 1. Giáo dục từ sớm
- Dạy con về tác hại của ma túy từ nhỏ
- Xây dựng lòng tin và sự gần gũi
- Tạo môi trường gia đình lành mạnh
- Làm gương tốt cho con

### 2. Quan tâm và theo dõi
- Dành thời gian cho con
- Quan sát những thay đổi trong hành vi
- Lắng nghe và chia sẻ với con
- Phát hiện sớm các dấu hiệu bất thường

### 3. Xây dựng kỹ năng sống
- Dạy con cách từ chối ma túy
- Rèn luyện kỹ năng giao tiếp
- Xây dựng lòng tự tin
- Hướng dẫn cách giải quyết vấn đề

## Dấu hiệu cảnh báo

### Thay đổi về thể chất
- Sụt cân nhanh
- Mắt đỏ, mệt mỏi
- Thay đổi giấc ngủ
- Vệ sinh cá nhân kém

### Thay đổi về hành vi
- Cô lập, ít giao tiếp
- Thay đổi bạn bè
- Bỏ học, trốn học
- Ăn cắp, nói dối

### Thay đổi về tâm lý
- Lo lắng, căng thẳng
- Thay đổi tâm trạng
- Thiếu động lực
- Trầm cảm

## Cách phòng chống

### 1. Xây dựng mối quan hệ tốt
- Dành thời gian chất lượng cho con
- Lắng nghe và tôn trọng ý kiến
- Tạo không gian chia sẻ
- Xây dựng lòng tin

### 2. Giáo dục đúng cách
- Cung cấp thông tin chính xác
- Tránh dọa nạt, đe dọa
- Sử dụng ví dụ thực tế
- Khuyến khích đặt câu hỏi

### 3. Tạo môi trường lành mạnh
- Hạn chế rượu bia trong gia đình
- Không hút thuốc trước mặt con
- Tổ chức hoạt động gia đình
- Xây dựng thói quen tốt

### 4. Phối hợp với nhà trường
- Tham gia họp phụ huynh
- Liên lạc thường xuyên với giáo viên
- Hỗ trợ các hoạt động phòng chống
- Chia sẻ thông tin về con

## Khi con có dấu hiệu nghiện

### 1. Bình tĩnh và kiên nhẫn
- Không la mắng, đe dọa
- Tìm hiểu nguyên nhân
- Thể hiện tình yêu thương
- Tìm kiếm sự giúp đỡ chuyên môn

### 2. Tìm kiếm hỗ trợ
- Liên hệ với chuyên gia tư vấn
- Tham gia nhóm hỗ trợ gia đình
- Tìm hiểu về các chương trình cai nghiện
- Xây dựng mạng lưới hỗ trợ

### 3. Đồng hành cùng con
- Hỗ trợ trong quá trình cai nghiện
- Không từ bỏ hy vọng
- Xây dựng kế hoạch phục hồi
- Tạo môi trường hỗ trợ

## Kết luận

Gia đình là lá chắn đầu tiên bảo vệ con em khỏi ma túy. Với tình yêu thương, sự quan tâm và giáo dục đúng cách, cha mẹ có thể giúp con tránh xa ma túy và xây dựng tương lai tốt đẹp.`,
    category: 'family',
    tags: ['gia đình', 'phòng chống', 'cha mẹ', 'con cái'],
    targetAudience: ['parent', 'general'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
      alt: 'Vai trò của gia đình',
      caption: 'Gia đình là nền tảng phòng chống ma túy'
    },
    seo: {
      metaTitle: 'Vai trò của gia đình trong phòng chống ma túy',
      metaDescription: 'Gia đình đóng vai trò quan trọng trong việc phòng chống ma túy. Hướng dẫn cách gia đình có thể bảo vệ con em mình.',
      keywords: ['gia đình', 'phòng chống ma túy', 'cha mẹ', 'con cái', 'giáo dục']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-01'),
    views: {
      count: 1800,
      uniqueViews: 1450,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Nghiên cứu mới về tác động của ma túy lên não bộ',
    slug: 'nghien-cuu-moi-ve-tac-dong-cua-ma-tuy-len-nao-bo',
    excerpt: 'Cập nhật những nghiên cứu mới nhất về tác động của ma túy lên não bộ và các phương pháp điều trị hiện đại.',
    content: `Các nghiên cứu mới nhất về tác động của ma túy lên não bộ đã cung cấp những hiểu biết sâu sắc về cơ chế gây nghiện và các phương pháp điều trị hiện đại.

## Tác động của ma túy lên não bộ

### 1. Hệ thống dopamine
Ma túy tác động trực tiếp lên hệ thống dopamine trong não, gây ra cảm giác hưng phấn và thúc đẩy hành vi tìm kiếm ma túy.

### 2. Thay đổi cấu trúc não
- Giảm thể tích chất xám
- Thay đổi kết nối thần kinh
- Suy giảm chức năng nhận thức
- Rối loạn điều hòa cảm xúc

### 3. Tác động lâu dài
- Tổn thương không thể phục hồi
- Tăng nguy cơ rối loạn tâm thần
- Suy giảm trí nhớ và khả năng học tập
- Thay đổi tính cách

## Phương pháp điều trị hiện đại

### 1. Liệu pháp dược lý
- Thuốc thay thế (Methadone, Buprenorphine)
- Thuốc chống thèm (Naltrexone)
- Thuốc điều trị rối loạn tâm thần
- Thuốc hỗ trợ cai nghiện

### 2. Liệu pháp tâm lý
- Liệu pháp nhận thức hành vi (CBT)
- Liệu pháp động lực
- Liệu pháp gia đình
- Liệu pháp nhóm

### 3. Công nghệ mới
- Kích thích não sâu (DBS)
- Liệu pháp gen
- Công nghệ thực tế ảo
- Ứng dụng di động hỗ trợ

## Kết quả nghiên cứu

### Tỷ lệ thành công
- Liệu pháp kết hợp: 60-70%
- Liệu pháp dược lý: 40-50%
- Liệu pháp tâm lý: 30-40%

### Yếu tố ảnh hưởng
- Thời gian nghiện
- Loại ma túy sử dụng
- Hỗ trợ gia đình và xã hội
- Động lực cai nghiện

## Hướng nghiên cứu tương lai

### 1. Y học cá thể hóa
- Phân tích gen
- Điều trị theo đặc điểm cá nhân
- Thuốc mới có hiệu quả cao

### 2. Công nghệ AI
- Chẩn đoán sớm
- Dự đoán nguy cơ tái nghiện
- Hỗ trợ điều trị thông minh

### 3. Phòng chống
- Vắc-xin chống ma túy
- Thuốc ngăn chặn tác dụng ma túy
- Phương pháp giáo dục mới

## Kết luận

Nghiên cứu về tác động của ma túy lên não bộ đã mở ra những hướng điều trị mới và hiệu quả hơn. Tuy nhiên, phòng chống vẫn là biện pháp quan trọng nhất.`,
    category: 'research',
    tags: ['nghiên cứu', 'não bộ', 'điều trị', 'khoa học'],
    targetAudience: ['general', 'counselor', 'teacher'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      alt: 'Nghiên cứu về não bộ',
      caption: 'Nghiên cứu tác động của ma túy lên não bộ'
    },
    seo: {
      metaTitle: 'Nghiên cứu mới về tác động của ma túy lên não bộ',
      metaDescription: 'Cập nhật những nghiên cứu mới nhất về tác động của ma túy lên não bộ và các phương pháp điều trị hiện đại.',
      keywords: ['nghiên cứu', 'ma túy', 'não bộ', 'điều trị', 'khoa học']
    },
    settings: {
      allowComments: true,
      requireApproval: true,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-05'),
    views: {
      count: 950,
      uniqueViews: 780,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Tác động của ma túy đối với thanh thiếu niên',
    slug: 'tac-dong-cua-ma-tuy-doi-voi-thanh-thieu-nien',
    excerpt: 'Phân tích lý do tại sao thanh thiếu niên dễ bị ảnh hưởng bởi ma túy và cách phòng tránh.',
    content: `Thanh thiếu niên là đối tượng dễ bị tác động bởi ma túy do tâm lý tò mò, áp lực bạn bè và thiếu kiến thức phòng tránh. Việc giáo dục và hỗ trợ kịp thời là rất quan trọng.

## Nguyên nhân phổ biến
- Tò mò, muốn thử cảm giác mới
- Áp lực từ bạn bè
- Thiếu sự quan tâm của gia đình
- Khó khăn trong học tập, cuộc sống

## Cách phòng tránh
- Tăng cường giáo dục kỹ năng sống
- Xây dựng môi trường học đường lành mạnh
- Gia đình quan tâm, lắng nghe con
- Hỗ trợ tâm lý kịp thời

## Kết luận
Phòng chống ma túy ở thanh thiếu niên cần sự phối hợp của gia đình, nhà trường và xã hội.`,
    category: 'education',
    tags: ['thanh thiếu niên', 'phòng tránh', 'giáo dục', 'gia đình'],
    targetAudience: ['student', 'parent', 'teacher'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800',
      alt: 'Tác động của ma túy với thanh thiếu niên',
      caption: 'Thanh thiếu niên và nguy cơ ma túy'
    },
    seo: {
      metaTitle: 'Tác động của ma túy đối với thanh thiếu niên',
      metaDescription: 'Phân tích lý do tại sao thanh thiếu niên dễ bị ảnh hưởng bởi ma túy và cách phòng tránh.',
      keywords: ['thanh thiếu niên', 'ma túy', 'phòng tránh', 'giáo dục']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-10'),
    views: {
      count: 700,
      uniqueViews: 600,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Vai trò của cộng đồng trong phòng chống ma túy',
    slug: 'vai-tro-cua-cong-dong-trong-phong-chong-ma-tuy',
    excerpt: 'Cộng đồng có thể làm gì để hỗ trợ phòng chống ma túy hiệu quả?',
    content: `Cộng đồng đóng vai trò quan trọng trong việc phát hiện, hỗ trợ và phòng chống ma túy. Sự phối hợp giữa các tổ chức xã hội, chính quyền và người dân là yếu tố then chốt.

## Các hoạt động cộng đồng
- Tổ chức tuyên truyền, giáo dục
- Hỗ trợ người cai nghiện tái hòa nhập
- Xây dựng môi trường sống an toàn
- Phát hiện và báo cáo kịp thời

## Kết luận
Mỗi cá nhân đều có thể góp phần xây dựng cộng đồng không ma túy.`,
    category: 'community',
    tags: ['cộng đồng', 'phòng chống', 'hỗ trợ', 'tuyên truyền'],
    targetAudience: ['general', 'parent', 'teacher'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800',
      alt: 'Cộng đồng phòng chống ma túy',
      caption: 'Cộng đồng chung tay phòng chống ma túy'
    },
    seo: {
      metaTitle: 'Vai trò của cộng đồng trong phòng chống ma túy',
      metaDescription: 'Cộng đồng có thể làm gì để hỗ trợ phòng chống ma túy hiệu quả?',
      keywords: ['cộng đồng', 'phòng chống', 'hỗ trợ', 'tuyên truyền']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-12'),
    views: {
      count: 500,
      uniqueViews: 400,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Những dấu hiệu cảnh báo sớm việc sử dụng ma túy',
    slug: 'nhung-dau-hieu-canh-bao-som-viec-su-dung-ma-tuy',
    excerpt: 'Nhận biết sớm các dấu hiệu sử dụng ma túy giúp can thiệp kịp thời.',
    content: `Việc phát hiện sớm các dấu hiệu sử dụng ma túy là rất quan trọng để can thiệp và hỗ trợ kịp thời.

## Dấu hiệu thể chất
- Sụt cân nhanh
- Mắt đỏ, mệt mỏi
- Thay đổi giấc ngủ

## Dấu hiệu hành vi
- Thay đổi bạn bè
- Bỏ học, trốn học
- Cô lập, ít giao tiếp

## Dấu hiệu tâm lý
- Lo lắng, căng thẳng
- Thay đổi tâm trạng
- Thiếu động lực

## Kết luận
Nếu phát hiện các dấu hiệu này, hãy tìm kiếm sự hỗ trợ từ chuyên gia.`,
    category: 'health',
    tags: ['dấu hiệu', 'cảnh báo', 'sức khỏe', 'can thiệp'],
    targetAudience: ['parent', 'teacher', 'counselor'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      alt: 'Dấu hiệu sử dụng ma túy',
      caption: 'Nhận biết dấu hiệu sử dụng ma túy'
    },
    seo: {
      metaTitle: 'Những dấu hiệu cảnh báo sớm việc sử dụng ma túy',
      metaDescription: 'Nhận biết sớm các dấu hiệu sử dụng ma túy giúp can thiệp kịp thời.',
      keywords: ['dấu hiệu', 'ma túy', 'cảnh báo', 'can thiệp']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-15'),
    views: {
      count: 350,
      uniqueViews: 300,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Phục hồi sau nghiện: Những điều cần biết',
    slug: 'phuc-hoi-sau-nghien-nhung-dieu-can-biet',
    excerpt: 'Quá trình phục hồi sau nghiện ma túy và các yếu tố hỗ trợ thành công.',
    content: `Phục hồi sau nghiện là một hành trình dài và cần sự hỗ trợ từ gia đình, cộng đồng và chuyên gia.

## Các giai đoạn phục hồi
- Thừa nhận vấn đề
- Tham gia chương trình cai nghiện
- Hỗ trợ tâm lý, y tế
- Tái hòa nhập cộng đồng

## Yếu tố hỗ trợ thành công
- Gia đình đồng hành
- Có việc làm ổn định
- Tham gia nhóm hỗ trợ

## Kết luận
Không ai phải phục hồi một mình. Sự hỗ trợ là chìa khóa thành công.`,
    category: 'success_stories',
    tags: ['phục hồi', 'cai nghiện', 'hỗ trợ', 'thành công'],
    targetAudience: ['general', 'parent', 'counselor'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      alt: 'Phục hồi sau nghiện',
      caption: 'Hành trình phục hồi sau nghiện'
    },
    seo: {
      metaTitle: 'Phục hồi sau nghiện: Những điều cần biết',
      metaDescription: 'Quá trình phục hồi sau nghiện ma túy và các yếu tố hỗ trợ thành công.',
      keywords: ['phục hồi', 'cai nghiện', 'hỗ trợ', 'thành công']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-18'),
    views: {
      count: 420,
      uniqueViews: 350,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Tài nguyên hỗ trợ phòng chống ma túy cho giáo viên',
    slug: 'tai-nguyen-ho-tro-phong-chong-ma-tuy-cho-giao-vien',
    excerpt: 'Danh sách tài liệu, website, tổ chức hỗ trợ giáo viên trong công tác phòng chống ma túy.',
    content: `Giáo viên cần được trang bị tài nguyên phù hợp để nâng cao hiệu quả phòng chống ma túy trong trường học.

## Tài liệu tham khảo
- Sách hướng dẫn phòng chống ma túy
- Tài liệu của Bộ Giáo dục
- Website phòng chống ma túy

## Tổ chức hỗ trợ
- Trung tâm tư vấn cai nghiện
- Nhóm hỗ trợ giáo viên
- Đường dây nóng hỗ trợ

## Kết luận
Sử dụng tài nguyên phù hợp giúp giáo viên tự tin hơn trong công tác phòng chống ma túy.`,
    category: 'resources',
    tags: ['tài nguyên', 'giáo viên', 'phòng chống', 'hỗ trợ'],
    targetAudience: ['teacher', 'counselor', 'parent'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800',
      alt: 'Tài nguyên cho giáo viên',
      caption: 'Tài nguyên hỗ trợ giáo viên phòng chống ma túy'
    },
    seo: {
      metaTitle: 'Tài nguyên hỗ trợ phòng chống ma túy cho giáo viên',
      metaDescription: 'Danh sách tài liệu, website, tổ chức hỗ trợ giáo viên trong công tác phòng chống ma túy.',
      keywords: ['tài nguyên', 'giáo viên', 'phòng chống', 'hỗ trợ']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-20'),
    views: {
      count: 210,
      uniqueViews: 180,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  },
  {
    title: 'Phòng chống ma túy trong gia đình: 5 nguyên tắc vàng',
    slug: 'phong-chong-ma-tuy-trong-gia-dinh-5-nguyen-tac-vang',
    excerpt: 'Những nguyên tắc quan trọng giúp gia đình bảo vệ con em khỏi ma túy.',
    content: `Gia đình là lá chắn đầu tiên giúp trẻ tránh xa ma túy. Dưới đây là 5 nguyên tắc vàng:

1. Gắn kết, lắng nghe con
2. Giáo dục về tác hại ma túy
3. Làm gương tốt
4. Phát hiện sớm dấu hiệu bất thường
5. Hợp tác với nhà trường, cộng đồng

## Kết luận
Gia đình chủ động phòng chống sẽ giúp trẻ phát triển an toàn, lành mạnh.`,
    category: 'family',
    tags: ['gia đình', 'nguyên tắc', 'bảo vệ', 'phòng chống'],
    targetAudience: ['parent', 'general'],
    lang: 'vi',
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800',
      alt: 'Gia đình phòng chống ma túy',
      caption: 'Gia đình là lá chắn phòng chống ma túy'
    },
    seo: {
      metaTitle: 'Phòng chống ma túy trong gia đình: 5 nguyên tắc vàng',
      metaDescription: 'Những nguyên tắc quan trọng giúp gia đình bảo vệ con em khỏi ma túy.',
      keywords: ['gia đình', 'phòng chống', 'nguyên tắc', 'bảo vệ']
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false
    },
    publishedAt: new Date('2024-02-22'),
    views: {
      count: 180,
      uniqueViews: 150,
      lastViewedAt: new Date()
    },
    likes: [],
    comments: []
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Get admin user
async function getAdminUser() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      throw new Error('No admin user found. Please create an admin user first.');
    }
    return admin;
  } catch (error) {
    console.error('❌ Error getting admin user:', error.message);
    throw error;
  }
}

// Seed blogs
async function seedBlogs() {
  try {
    console.log('🚀 Starting to seed blogs...');
    
    // Connect to database
    await connectDB();
    
    // Get admin user
    const admin = await getAdminUser();
    console.log('✅ Admin user found:', admin.email);
    
    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('✅ Cleared existing blogs');
    
    // Create blogs with admin as author
    const blogsWithAuthor = sampleBlogs.map(blog => ({
      ...blog,
      author: admin._id
    }));
    
    const createdBlogs = await Blog.insertMany(blogsWithAuthor);
    console.log(`✅ Created ${createdBlogs.length} blogs`);
    
    // Log created blogs
    createdBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} (${blog.status})`);
    });
    
    console.log('\n🎉 Blog seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedBlogs();
}

module.exports = { seedBlogs }; 