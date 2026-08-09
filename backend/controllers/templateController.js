import EmailSmsTemplate, { TEMPLATE_KEYS, CHANNELS } from "../models/EmailSmsTemplate.js";
import { DEFAULT_TEMPLATES } from "../utils/defaultTemplates.js";

// Ensures every (key, channel) pair exists at least once, using defaults.
const ensureSeeded = async () => {
  const existingCount = await EmailSmsTemplate.countDocuments({});
  if (existingCount >= TEMPLATE_KEYS.length * CHANNELS.length) return;

  for (const tpl of DEFAULT_TEMPLATES) {
    await EmailSmsTemplate.updateOne(
      { key: tpl.key, channel: tpl.channel },
      { $setOnInsert: tpl },
      { upsert: true }
    );
  }
};

/**
 * GET /api/admin/settings/templates
 */
export const getTemplates = async (req, res) => {
  try {
    await ensureSeeded();
    const templates = await EmailSmsTemplate.find({}).sort({ key: 1, channel: 1 });
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error("getTemplates error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching templates.",
    });
  }
};

/**
 * PATCH /api/admin/settings/templates/:key/:channel
 * Body: { subject?, body, isActive? }
 */
export const updateTemplate = async (req, res) => {
  try {
    const { key, channel } = req.params;
    const { subject, body, isActive } = req.body;

    if (!TEMPLATE_KEYS.includes(key) || !CHANNELS.includes(channel)) {
      return res.status(400).json({ success: false, message: "Invalid template key or channel." });
    }

    if (body !== undefined && !body.trim()) {
      return res.status(400).json({ success: false, message: "Body cannot be empty." });
    }

    const update = {};
    if (subject !== undefined) update.subject = subject;
    if (body !== undefined) update.body = body;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const template = await EmailSmsTemplate.findOneAndUpdate(
      { key, channel },
      update,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    return res.status(200).json({ success: true, message: "Template updated.", data: template });
  } catch (error) {
    console.error("updateTemplate error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the template.",
    });
  }
};