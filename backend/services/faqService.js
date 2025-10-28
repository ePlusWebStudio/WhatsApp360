const db = require('../config/database');
const logger = require('../utils/logger');

class FAQService {
  constructor() {
    this.faqs = [];
    this.loadFAQs();
  }

  async loadFAQs() {
    try {
      const rows = await db.query('SELECT * FROM faq WHERE id IS NOT NULL');
      this.faqs = Array.isArray(rows) ? rows : [];
      logger.info(`✅ Loaded ${this.faqs.length} FAQs`);
    } catch (error) {
      logger.error('Error loading FAQs:', error);
      this.faqs = [];
    }
  }

  // Calculate text similarity using Jaccard similarity
  calculateSimilarity(text1, text2) {
    const normalize = (text) => {
      return text
        .toLowerCase()
        .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .trim();
    };

    const t1 = normalize(text1).split(/\s+/);
    const t2 = normalize(text2).split(/\s+/);
    const set1 = new Set(t1);
    const set2 = new Set(t2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  async findAnswer(userQuestion) {
    try {
      let bestMatch = null;
      let highestScore = 0;

      this.faqs.forEach((faq) => {
        let score = this.calculateSimilarity(userQuestion, faq.question);

        // Check keywords if available
        if (faq.keywords) {
          try {
            const keywords = typeof faq.keywords === 'string' 
              ? JSON.parse(faq.keywords) 
              : faq.keywords;
            
            const keywordMatch = keywords.some(keyword =>
              userQuestion.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (keywordMatch) {
              score += 0.3;
            }
          } catch (e) {
            logger.debug('Error parsing keywords:', e);
          }
        }

        if (score > highestScore && score > 0.5) {
          highestScore = score;
          bestMatch = faq;
        }
      });

      if (bestMatch) {
        // Update usage count
        await db.query(
          'UPDATE faq SET usage_count = usage_count + 1 WHERE id = ?',
          [bestMatch.id]
        );

        return {
          found: true,
          answer: bestMatch.answer,
          confidence: Math.round(highestScore * 100),
          question: bestMatch.question
        };
      }

      return {
        found: false,
        suggestions: this.getSuggestions()
      };
    } catch (error) {
      logger.error('Error finding answer:', error);
      return { found: false, error: error.message };
    }
  }

  getSuggestions() {
    return this.faqs
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5)
      .map(faq => faq.question);
  }

  async addFAQ(question, answer, keywords = [], category = 'general') {
    try {
      const result = await db.query(
        'INSERT INTO faq (question, answer, keywords, category) VALUES (?, ?, ?, ?)',
        [question, answer, JSON.stringify(keywords), category]
      );

      await this.loadFAQs();
      const insertId = result && result.insertId ? result.insertId : null;
      logger.info(`✅ FAQ added with ID: ${insertId}`);
      return { success: true, id: insertId };
    } catch (error) {
      logger.error('Error adding FAQ:', error);
      throw error;
    }
  }

  async updateFAQ(id, question, answer, keywords, category) {
    try {
      await db.query(
        'UPDATE faq SET question = ?, answer = ?, keywords = ?, category = ? WHERE id = ?',
        [question, answer, JSON.stringify(keywords), category, id]
      );

      await this.loadFAQs();
      logger.info(`✅ FAQ updated with ID: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('Error updating FAQ:', error);
      throw error;
    }
  }

  async deleteFAQ(id) {
    try {
      await db.query('DELETE FROM faq WHERE id = ?', [id]);
      await this.loadFAQs();
      logger.info(`✅ FAQ deleted with ID: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting FAQ:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_faqs,
          SUM(usage_count) as total_usage,
          AVG(usage_count) as avg_usage
        FROM faq
      `);

      const topFAQs = await db.query(`
        SELECT id, question, answer, usage_count 
        FROM faq 
        ORDER BY usage_count DESC 
        LIMIT 10
      `);

      return {
        statistics: Array.isArray(stats) && stats.length > 0 ? stats[0] : {},
        topFAQs: Array.isArray(topFAQs) ? topFAQs : []
      };
    } catch (error) {
      logger.error('Error getting FAQ statistics:', error);
      throw error;
    }
  }

  async handleIncomingQuestion(userId, question) {
    try {
      const result = await this.findAnswer(question);

      if (result.found) {
        const response = `💡 *${result.question}*\n\n${result.answer}\n\n_الثقة: ${result.confidence}%_`;

        // Log interaction
        await db.query(
          'INSERT INTO interactions (user_id, interaction_type, interaction_data) VALUES (?, ?, ?)',
          [userId, 'faq_query', JSON.stringify({ question, answer: result.answer, confidence: result.confidence })]
        );

        return { type: 'answer', content: response };
      } else {
        const suggestions = result.suggestions;
        const response = `🤔 عذراً، لم أجد إجابة دقيقة لسؤالك.\n\nربما تقصد أحد هذه الأسئلة:\n\n${suggestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nأو يمكنك الرد بـ "دعم" للتواصل مع فريق الدعم.`;

        return { type: 'no_answer', content: response, suggestions };
      }
    } catch (error) {
      logger.error('Error handling incoming question:', error);
      throw error;
    }
  }

  async getAllFAQs(category = null) {
    try {
      let query = 'SELECT * FROM faq';
      const params = [];

      if (category) {
        query += ' WHERE category = ?';
        params.push(category);
      }

      query += ' ORDER BY usage_count DESC';

      const faqs = await db.query(query, params);
      return Array.isArray(faqs) ? faqs : [];
    } catch (error) {
      logger.error('Error getting all FAQs:', error);
      throw error;
    }
  }

  async searchFAQs(searchTerm) {
    try {
      const results = await db.query(`
        SELECT * FROM faq 
        WHERE question LIKE ? OR answer LIKE ? OR keywords LIKE ?
        ORDER BY usage_count DESC
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

      return Array.isArray(results) ? results : [];
    } catch (error) {
      logger.error('Error searching FAQs:', error);
      throw error;
    }
  }
}

module.exports = new FAQService();
