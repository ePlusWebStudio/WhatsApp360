-- WhatsApp360 Bot Database Schema
-- Created for EPLUSWEB Academy Community Management System

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    engagement_score INT DEFAULT 0,
    user_type ENUM('regular', 'vip', 'admin') DEFAULT 'regular',
    metadata JSON,
    INDEX idx_phone (phone_number),
    INDEX idx_active (is_active),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message_type ENUM('incoming', 'outgoing') NOT NULL,
    content LONGTEXT,
    media_url VARCHAR(500),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    message_id VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_type (message_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description LONGTEXT,
    instructor VARCHAR(100),
    schedule_date DATETIME NOT NULL,
    duration_minutes INT,
    materials JSON,
    max_participants INT,
    current_participants INT DEFAULT 0,
    status ENUM('draft', 'published', 'ongoing', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_schedule (schedule_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interactions Table
CREATE TABLE IF NOT EXISTS interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    interaction_type VARCHAR(50),
    interaction_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (interaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT NOT NULL,
    user_id INT NOT NULL,
    answers JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_response (survey_id, user_id),
    INDEX idx_survey_id (survey_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Content Table
CREATE TABLE IF NOT EXISTS scheduled_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type VARCHAR(50),
    content LONGTEXT NOT NULL,
    media_url VARCHAR(500),
    schedule_time DATETIME NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
    target_audience VARCHAR(100) DEFAULT 'all',
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_schedule_time (schedule_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQ Table
CREATE TABLE IF NOT EXISTS faq (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer LONGTEXT NOT NULL,
    keywords JSON,
    category VARCHAR(100),
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    FULLTEXT INDEX ft_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL,
    template_type ENUM('welcome', 'reminder', 'follow_up', 'survey', 'announcement') DEFAULT 'welcome',
    content LONGTEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (template_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    messages_sent INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    avg_response_time INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample FAQ data
INSERT INTO faq (question, answer, keywords, category, usage_count) VALUES
('ما هي أكاديمية اي بلس ويب؟', 'أكاديمية اي بلس ويب متخصصة في تدريب ريادة الأعمال والتسويق الرقمي. نقدم دورات عملية وحصرية مع خبراء المجال.', '["أكاديمية", "عن", "معلومات"]', 'general', 0),
('كيف يمكنني التسجيل في الدورات؟', 'يمكنك التسجيل مباشرة من خلال الرد بـ "دورات" لعرض الدورات المتاحة، ثم اختيار الدورة المطلوبة.', '["تسجيل", "دورات", "كيف"]', 'courses', 0),
('ما هي ساعات العمل؟', 'ساعات عملنا من السبت إلى الخميس من 9:00 صباحاً إلى 6:00 مساءً. الجمعة مغلق.', '["ساعات", "عمل", "وقت"]', 'support', 0),
('كيف يمكنني التواصل مع الدعم؟', 'يمكنك التواصل معنا عبر البريد الإلكتروني info@eplusweb.com أو الهاتف. اكتب "دعم" للمزيد من المعلومات.', '["دعم", "تواصل", "اتصال"]', 'support', 0),
('هل هناك شهادات بعد إنهاء الدورة؟', 'نعم، جميع الدورات تشمل شهادات معتمدة بعد إنهاء البرنامج بنجاح.', '["شهادة", "إنهاء", "برنامج"]', 'courses', 0);

-- Insert sample message templates
INSERT INTO message_templates (template_name, template_type, content, variables, is_active) VALUES
('ترحيب عام', 'welcome', '🎉 مرحباً بك في أكاديمية {academyName}!\n\nنحن سعداء بانضمامك إلى مجتمعنا المتخصص في ريادة الأعمال والتسويق الرقمي.\n\nللبدء، اكتب "مساعدة" 📋', '{"academyName": "أكاديمية اي بلس ويب"}', TRUE),
('تذكير الدورة', 'reminder', '⏰ تذكير بدورة قادمة\n\n📚 {courseName}\n⏱️ الموعد: {courseDate}\n⌛ متبقي: {hoursLeft} ساعة\n\nنراك قريباً! 🚀', '{"courseName": "", "courseDate": "", "hoursLeft": ""}', TRUE),
('متابعة بعد 24 ساعة', 'follow_up', 'مرحباً مجدداً! 👋\n\nهل لديك أي أسئلة حول الأكاديمية؟\nفريقنا جاهز لمساعدتك في أي وقت.\n\nللحصول على قائمة الأوامر، اكتب "مساعدة" 📋', '{}', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_messages_user_date ON messages(user_id, sent_at);
CREATE INDEX idx_interactions_user_type ON interactions(user_id, interaction_type);
CREATE INDEX idx_courses_upcoming ON courses(schedule_date);

-- Set default character set for the database
ALTER DATABASE eplus_wabot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Display completion message
SELECT 'Database schema created successfully!' as status;
