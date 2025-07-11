const mongoose = require("mongoose");
const Assessment = require("./models/Assessment");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/drug_prevention")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const assessments = [
  {
    name: "ASSIST",
    type: "ASSIST",
    fullName: "Alcohol, Smoking and Substance Involvement Screening Test",
    description: "Công cụ sàng lọc toàn diện đánh giá mức độ rủi ro sử dụng các chất gây nghiện.",
    version: "3.1",
    language: "vi",
    targetAgeGroup: ["university_student", "parent", "teacher", "other"],
    estimatedTime: 15,
    isActive: true,
    questions: [
      {
        order: 1,
        question: "Trong đời bạn, bạn đã bao giờ sử dụng những chất dưới đây chưa? (CHỈ SỬ DỤNG TRONG Y TẾ)",
        type: "multiple_choice",
        category: "substance_use",
        weightage: 1,
        options: [
          { text: "Không bao giờ", value: 0 },
          { text: "Có, nhưng không trong 3 tháng qua", value: 2 },
          { text: "Có, trong 3 tháng qua", value: 4 }
        ]
      },
      {
        order: 2,
        question: "Trong 3 tháng qua, bạn có thường xuyên muốn sử dụng các chất này không?",
        type: "multiple_choice",
        category: "craving",
        weightage: 1,
        options: [
          { text: "Không bao giờ", value: 0 },
          { text: "Một hoặc hai lần", value: 3 },
          { text: "Hàng tháng", value: 4 },
          { text: "Hàng tuần", value: 5 },
          { text: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
        ]
      },
      {
        order: 3,
        question: "Trong 3 tháng qua, việc sử dụng các chất này có gây ra vấn đề về sức khỏe, xã hội, pháp lý hoặc tài chính cho bạn không?",
        type: "multiple_choice",
        category: "problems",
        weightage: 1,
        options: [
          { text: "Không bao giờ", value: 0 },
          { text: "Một hoặc hai lần", value: 4 },
          { text: "Hàng tháng", value: 5 },
          { text: "Hàng tuần", value: 6 },
          { text: "Hàng ngày hoặc gần như hàng ngày", value: 7 }
        ]
      },
      {
        order: 4,
        question: "Trong 3 tháng qua, bạn có thất bại trong việc làm điều mà bình thường mong đợi từ bạn vì sử dụng các chất này không?",
        type: "multiple_choice",
        category: "failure",
        weightage: 1,
        options: [
          { text: "Không bao giờ", value: 0 },
          { text: "Một hoặc hai lần", value: 5 },
          { text: "Hàng tháng", value: 6 },
          { text: "Hàng tuần", value: 7 },
          { text: "Hàng ngày hoặc gần như hàng ngày", value: 8 }
        ]
      },
      {
        order: 5,
        question: "Có bạn bè, người thân hoặc người khác nào bày tỏ sự quan ngại về việc sử dụng các chất này của bạn không?",
        type: "multiple_choice",
        category: "concern",
        weightage: 1,
        options: [
          { text: "Không, không bao giờ", value: 0 },
          { text: "Có, trong 3 tháng qua", value: 6 },
          { text: "Có, nhưng không trong 3 tháng qua", value: 3 }
        ]
      },
      {
        order: 6,
        question: "Bạn có bao giờ cố gắng kiểm soát, cắt giảm hoặc dừng sử dụng các chất này nhưng không thành công không?",
        type: "multiple_choice",
        category: "control",
        weightage: 1,
        options: [
          { text: "Không, không bao giờ", value: 0 },
          { text: "Có, trong 3 tháng qua", value: 6 },
          { text: "Có, nhưng không trong 3 tháng qua", value: 3 }
        ]
      },
      {
        order: 7,
        question: "Bạn có bao giờ sử dụng bất kỳ loại thuốc nào bằng cách tiêm không?",
        type: "yes_no",
        category: "injection",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có, trong 3 tháng qua", value: 2 },
          { text: "Có, nhưng không trong 3 tháng qua", value: 1 }
        ]
      }
    ],
    scoring: {
      method: "sum",
      maxScore: 39,
      riskLevels: [
        {
          level: "low",
          name: "Rủi ro thấp",
          description: "Không có rủi ro đáng kể",
          minScore: 0,
          maxScore: 3,
          color: "#10B981",
          recommendations: [
            "Tiếp tục duy trì lối sống lành mạnh",
            "Tăng cường kiến thức về tác hại của các chất gây nghiện"
          ]
        },
        {
          level: "moderate",
          name: "Rủi ro trung bình",
          description: "Có dấu hiệu cần can thiệp sớm",
          minScore: 4,
          maxScore: 26,
          color: "#F59E0B",
          recommendations: [
            "Tham gia tư vấn ngắn hạn",
            "Giảm thiểu việc sử dụng các chất có nguy cơ",
            "Tham gia các hoạt động tích cực khác"
          ]
        },
        {
          level: "high",
          name: "Rủi ro cao",
          description: "Cần can thiệp chuyên sâu ngay lập tức",
          minScore: 27,
          maxScore: 39,
          color: "#EF4444",
          recommendations: [
            "Tham gia chương trình điều trị chuyên sâu",
            "Liên hệ với chuyên gia y tế",
            "Tham gia nhóm hỗ trợ",
            "Cần sự giám sát y tế thường xuyên"
          ]
        }
      ]
    },
    metadata: {
      developedBy: "WHO",
      validatedFor: ["adults", "adolescents"],
      lastUpdated: new Date(),
      references: [
        "WHO ASSIST Working Group. The Alcohol, Smoking and Substance Involvement Screening Test (ASSIST): development, reliability and feasibility. Addiction. 2002;97(9):1183-1194."
      ]
    }
  },
  {
    name: "CRAFFT",
    type: "CRAFFT",
    fullName: "Car, Relax, Alone, Forget, Friends, Trouble",
    description: "Công cụ sàng lọc dành cho thanh thiếu niên từ 12-21 tuổi về rủi ro sử dụng chất gây nghiện.",
    version: "2.1",
    language: "vi",
    targetAgeGroup: ["student", "university_student"],
    estimatedTime: 10,
    isActive: true,
    questions: [
      {
        order: 1,
        question: "Bạn có bao giờ đi trên xe hơi do người đã uống rượu bia hoặc sử dụng ma túy lái xe không?",
        type: "yes_no",
        category: "car",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      },
      {
        order: 2,
        question: "Bạn có sử dụng rượu bia hoặc ma túy để thư giãn, cảm thấy tốt hơn về bản thân hoặc hòa nhập không?",
        type: "yes_no",
        category: "relax",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      },
      {
        order: 3,
        question: "Bạn có sử dụng rượu bia hoặc ma túy khi ở một mình không?",
        type: "yes_no",
        category: "alone",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      },
      {
        order: 4,
        question: "Bạn có quên những gì mình đã làm khi sử dụng rượu bia hoặc ma túy không?",
        type: "yes_no",
        category: "forget",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      },
      {
        order: 5,
        question: "Có bạn bè hoặc gia đình nói rằng bạn nên cắt giảm việc uống rượu bia hoặc sử dụng ma túy không?",
        type: "yes_no",
        category: "friends",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      },
      {
        order: 6,
        question: "Bạn có gặp rắc rối khi sử dụng rượu bia hoặc ma túy không?",
        type: "yes_no",
        category: "trouble",
        weightage: 1,
        options: [
          { text: "Không", value: 0 },
          { text: "Có", value: 1 }
        ]
      }
    ],
    scoring: {
      method: "sum",
      maxScore: 6,
      riskLevels: [
        {
          level: "low",
          name: "Rủi ro thấp",
          description: "Không có vấn đề nghiêm trọng",
          minScore: 0,
          maxScore: 1,
          color: "#10B981",
          recommendations: [
            "Tiếp tục tránh xa các chất gây nghiện",
            "Tham gia các hoạt động tích cực"
          ]
        },
        {
          level: "moderate",
          name: "Rủi ro trung bình",
          description: "Cần đánh giá thêm và can thiệp",
          minScore: 2,
          maxScore: 6,
          color: "#F59E0B",
          recommendations: [
            "Tham gia chương trình tư vấn",
            "Tìm hiểu về tác hại của các chất gây nghiện",
            "Xây dựng kỹ năng từ chối",
            "Tham gia hoạt động nhóm tích cực"
          ]
        }
      ]
    },
    metadata: {
      developedBy: "Boston Children's Hospital",
      validatedFor: ["adolescents"],
      lastUpdated: new Date(),
      references: [
        "Knight JR, Sherritt L, Shrier LA, Harris SK, Chang G. Validity of the CRAFFT substance abuse screening test among adolescent clinic patients. Arch Pediatr Adolesc Med. 2002;156(6):607-614."
      ]
    }
  }
];

const seedAssessments = async () => {
  try {
    // Clear existing assessments
    await Assessment.deleteMany({});
    console.log("Cleared existing assessments");

    // Insert new assessments
    const result = await Assessment.insertMany(assessments);
    console.log(`Seeded ${result.length} assessments successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding assessments:", error);
    process.exit(1);
  }
};

seedAssessments();