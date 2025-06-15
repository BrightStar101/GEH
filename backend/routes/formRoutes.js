// routes/formController.js

const express = require('express');
const router = express.Router();
const logger = require('../utils/loggerUtils');
const { loadFormSchema } = require('../utils/formSchemaLoader');
// const sanitizeInput = require('../utils/sanitizeInput');
const { ForbiddenError, ValidationError } = require('../utils/errorUtils');
const formModel = require('../models/formModel');
const { authenticate } = require('../middleware/authMiddleware');
const { generateFormPDF } = require('../services/formFillerService');
const userModel = require('../models/userModel');
const AuditLog = require('../models/AuditLog');

// Middleware: Ensure schema is loaded in request context
async function attachFormSchema(req, res, next) {
  try {
    const { formId, language } = req.body;
    const user = req.user;

    const { schema } = await loadFormSchema(formId, user.id, language);
    req.formSchema = schema;
    next();
  } catch (err) {
    return res.status(err.statusCode).json(err);
    // next(err);
  }
}

/**
 * GET /api/form/
 * Returns all forms for logined user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const forms = await formModel.find({ userId: req.user?.id });
    res.json(forms);
  } catch (err) {
    logger.logError({
      action: 'form_get_failed',
      userId: req.user?.id,
      error: err.message,
    });
    next(err);
  }
});

/**
 * POST /api/form/next
 * Returns the next question in the schema-based flow
 */
router.post('/next', authenticate, attachFormSchema, async (req, res, next) => {
  try {
    const { formId, language, currentIndex = 0, answers = {} } = req.body;
    const schema = req.formSchema;

    if (!schema.questions || !Array.isArray(schema.questions)) {
      throw new Error('Malformed form schema');
    }

    // Track answers in session or per-user backend if tier allows
    // req.session.formAnswers = req.session.formAnswers || {};
    // req.session.formAnswers[formId] = {
    //   ...(req.session.formAnswers[formId] || {}),
    //   ...answers,
    // };

    const nextQuestion = schema.questions[currentIndex];

    if (!nextQuestion) {
      const filePath = await generateFormPDF({
        userId: req.user.id,
        formId,
        schema,
        answers
      });

      const newForm = new formModel({
        userId: req.user.id,
        formId,
        filePath,
        languageCode: language,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
      });

      await newForm.save();

      let user = await userModel.findById(req.user.id);
      user.formUsed += 1
      await user.save();

      await new AuditLog({
        userId: user._id,
        action: 'New form created',
        metadata: {
          formId
        }
      }).save();

      logger.logInfo({
        action: 'form_flow_complete',
        userId: req.user.id,
        formId,
      });

      return res.json({
        status: 'complete',
        message: 'Form complete. You can now review and download your responses.',
        form_id: newForm._id
      });
    }

    return res.json({
      status: schema.questions[currentIndex + 1] ? 'in_progress' : 'last',
      currentIndex,
      question: nextQuestion,
    });
  } catch (err) {
    logger.logError({
      action: 'form_flow_failed',
      userId: req.user?.id,
      error: err.message,
    });
    next(err);
  }
});

/**
 * POST /api/form/answer
 * Validates and stores a user's answer for a specific question
 */
router.post('/answer', attachFormSchema, async (req, res, next) => {
  try {
    const { formId, questionName, value } = req.body;
    const schema = req.formSchema;

    const question = schema.questions.find(q => q.name === questionName);
    if (!question) {
      throw new ValidationError(`Question ${questionName} not found in schema`);
    }

    if (question.required && (!value || value.trim() === '')) {
      throw new ValidationError('This question is required.');
    }

    if (question.type === 'number' && isNaN(value)) {
      throw new ValidationError('Value must be a number.');
    }

    // req.session.formAnswers = req.session.formAnswers || {};
    // req.session.formAnswers[formId] = {
    //   ...(req.session.formAnswers[formId] || {}),
    //   [questionName]: value//sanitizeInput(value),
    // };

    return res.json({ status: 'ok' });
  } catch (err) {
    logger.error({
      action: 'form_answer_failed',
      userId: req.user?.id,
      error: err.message,
    });
    next(err);
  }
});

/**
 * GET /api/form/answers/:formId
 * Returns all stored answers for review
 */
router.get('/answers/:formId', async (req, res, next) => {
  try {
    const formId = req.params.formId;
    const answers = req.session.formAnswers?.[formId] || {};

    return res.json({ answers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
