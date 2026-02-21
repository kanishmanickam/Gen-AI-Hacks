/**
 * Compare Route Handler
 * Handles vendor comparison and AI recommendations
 */

const express = require('express');
const { generateRecommendation } = require('../services/aiService');

const router = express.Router();

/**
 * POST /api/compare
 * Compare multiple vendor quotations and generate recommendation
 * Expected body: { quotations: Array<QuotationData> }
 */
router.post('/', async (req, res) => {
  try {
    const { quotations } = req.body;

    if (!quotations || !Array.isArray(quotations) || quotations.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Expected array of quotations.' 
      });
    }

    console.log(`📊 Comparing ${quotations.length} vendor quotations`);

    // Filter out failed extractions
    const validQuotations = quotations.filter(q => q.success !== false && q.vendor);

    if (validQuotations.length === 0) {
      return res.status(400).json({ 
        error: 'No valid quotations to compare' 
      });
    }

    // Perform basic comparison
    const comparison = {
      totalQuotations: validQuotations.length,
      lowestPrice: null,
      fastestDelivery: null,
      quotations: validQuotations
    };

    // Find lowest price
    const quotationsWithPrice = validQuotations.filter(q => q.price > 0);
    if (quotationsWithPrice.length > 0) {
      comparison.lowestPrice = quotationsWithPrice.reduce((min, q) => 
        q.price < min.price ? q : min
      );
    }

    // Find fastest delivery
    const quotationsWithDelivery = validQuotations.filter(q => q.delivery_days > 0);
    if (quotationsWithDelivery.length > 0) {
      comparison.fastestDelivery = quotationsWithDelivery.reduce((fastest, q) => 
        q.delivery_days < fastest.delivery_days ? q : fastest
      );
    }

    // Generate AI recommendation if API key is available
    let recommendation = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🤖 Generating AI recommendation...`);
        recommendation = await generateRecommendation(validQuotations);
      } catch (error) {
        console.error('Recommendation error:', error);
        recommendation = {
          error: 'Failed to generate AI recommendation',
          message: error.message
        };
      }
    } else {
      recommendation = {
        message: 'Gemini API key not configured. Add GEMINI_API_KEY to .env for AI recommendations.'
      };
    }

    // Enhanced structured response with detailed analysis
    const enhancedResponse = {
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        totalVendors: validQuotations.length,
        lowestPrice: comparison.lowestPrice?.price,
        lowestPriceVendor: comparison.lowestPrice?.vendor,
        fastestDelivery: comparison.fastestDelivery?.delivery_days,
        fastestDeliveryVendor: comparison.fastestDelivery?.vendor
      },
      comparison: comparison,
      recommendation: recommendation,
      extractedFields: {
        description: "Structured vendor data extracted from quotations",
        fields: [
          { name: "vendor", description: "Company name", type: "string" },
          { name: "price", description: "Total quotation price", type: "number" },
          { name: "delivery_days", description: "Delivery time in days", type: "number" },
          { name: "tax", description: "Tax/GST amount or percentage", type: "string" },
          { name: "description", description: "Products/services description", type: "string" },
          { name: "currency", description: "Currency code (USD, INR, EUR, etc.)", type: "string" }
        ],
        vendors: validQuotations.map((q, idx) => ({
          rank: idx + 1,
          vendor: q.vendor,
          price: q.price,
          currency: q.currency || 'N/A',
          delivery_days: q.delivery_days,
          tax: q.tax,
          fileName: q.fileName,
          description: q.description
        }))
      }
    };

    res.json(enhancedResponse);

  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/compare/analyze
 * Get detailed analysis of quotations
 */
router.post('/analyze', async (req, res) => {
  try {
    const { quotations } = req.body;

    if (!quotations || !Array.isArray(quotations)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const validQuotations = quotations.filter(q => q.success !== false && q.vendor);

    // Calculate statistics
    const prices = validQuotations.map(q => q.price).filter(p => p > 0);
    const deliveryTimes = validQuotations.map(q => q.delivery_days).filter(d => d > 0);

    const analysis = {
      totalVendors: validQuotations.length,
      priceStats: prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        range: Math.max(...prices) - Math.min(...prices)
      } : null,
      deliveryStats: deliveryTimes.length > 0 ? {
        min: Math.min(...deliveryTimes),
        max: Math.max(...deliveryTimes),
        avg: deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      } : null
    };

    res.json({ analysis });

  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
