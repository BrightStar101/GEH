// File: /backend/controllers/pdfStorageController.js
// Purpose: PDF access enforcement, expiry calculation, and download protection

import storageService from "../services/pdfStorageService.js";
import fs from "fs.js";
import path from "path.js";

/**
 * checkFileAccess
 * Validates user has permission and file is not expired
 */
export async function checkFileAccess(req, res) {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const access = await storageService.validateFileAccess(fileId, userId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason });
    }

    return res.json({ success: true, message: "Access granted" });
  } catch (err) {
    console.error("Error in checkFileAccess:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

/**
 * checkExpiryCountdown
 * Returns how many days are left before the file expires
 */
export async function checkExpiryCountdown(req, res) {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const result = await storageService.getRemainingDays(fileId, userId);
    if (!result.success) {
      return res.status(403).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("Error in checkExpiryCountdown:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

/**
 * downloadPdf
 * Allows the user to download their file if eligible
 */
export async function downloadPdf(req, res) {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const access = await storageService.validateFileAccess(fileId, userId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason });
    }

    const filePath = path.join("storage/pdfs", `${fileId}.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    res.download(filePath);
  } catch (err) {
    console.error("Error in downloadPdf:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
