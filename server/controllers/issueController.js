import Issue from '../models/Issue.js';

const issueCategories = ['Roads & Potholes', 'Garbage & Sanitation', 'Water Supply', 'Electricity', 'Streetlights', 'Drainage', 'Traffic', 'Other'];

const parseDetection = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    }
};

const normalizeCategory = (category, summary = '') => {
    const detectedText = `${category || ''} ${summary}`.toLowerCase();
    if (issueCategories.includes(category)) return category;
    if (/pothole|road damage|road issue|road surface|asphalt|pavement|street crack|road crack|sinkhole|\broads?\b/.test(detectedText)) return 'Roads & Potholes';
    if (/garbage|trash|rubbish|litter|waste|dump/.test(detectedText)) return 'Garbage & Sanitation';
    if (/water leak|water pipe|flooded pipe|no water|water supply/.test(detectedText)) return 'Water Supply';
    if (/electric wire|power line|power outage|electrical|transformer/.test(detectedText)) return 'Electricity';
    if (/streetlight|street light|lamp post|light pole|dark street/.test(detectedText)) return 'Streetlights';
    if (/drain|sewer|stormwater|blocked channel/.test(detectedText)) return 'Drainage';
    if (/traffic|signal|traffic light|congestion|road sign/.test(detectedText)) return 'Traffic';
    return 'Other';
};


export const detectIssueCategory = async (request, response) => {
    try {
        const { image } = request.body || {};

        if (!process.env.GEMINI_API_KEY) {
            return response.status(503).json({
                message: 'AI issue detection is not configured'
            });
        }

        if (!image || !image.startsWith('data:image/')) {
            return response.status(400).json({
                message: 'A valid image is required for detection'
            });
        }

        const imageMatch = image.match(
            /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
        );

        if (!imageMatch || image.length > 7 * 1024 * 1024) {
            return response.status(400).json({
                message: 'Please upload an image smaller than 5 MB'
            });
        }

        const prompt = `
You are a civic infrastructure image classification AI.

LOOK AT THE IMAGE CAREFULLY BEFORE ANSWERING.

Identify the main visible civic object, area, or problem in the image. The object does NOT need to be damaged. Classify what the image is mainly showing.

You MUST choose exactly ONE of these categories:

1. Roads & Potholes
2. Garbage & Sanitation
3. Water Supply
4. Electricity
5. Streetlights
6. Drainage
7. Traffic
8. Other

CLASSIFICATION:

Roads & Potholes:
potholes, damaged roads, broken asphalt, cracks, broken pavement,
uneven roads, sinkholes, road surface damage.

Garbage & Sanitation:
garbage, trash, litter, waste piles, overflowing bins,
dumped waste, dirty public areas caused by garbage.

Water Supply:
broken water pipes, leaking water pipes, water pipeline damage,
water supply infrastructure problems.

Electricity:
electrical wires, damaged/fallen electric poles, transformers,
exposed electrical equipment, electrical infrastructure damage.

Streetlights:
broken streetlights, damaged streetlight poles,
fallen streetlight poles, damaged lamps.

Drainage:
blocked drains, open drains, broken drains, overflowing drains,
drainage channels, water accumulation clearly caused by drainage.

Traffic:
broken traffic lights, damaged traffic signs, damaged barriers,
traffic-control infrastructure.

DECISION RULES:

- If a recognizable civic object or area is visible, DO NOT choose Other, even if it looks normal or undamaged.
- Any image mainly showing a road, street surface, pavement, or pothole belongs to Roads & Potholes.
- Any image mainly showing garbage, bins, litter, or waste belongs to Garbage & Sanitation.
- Any image mainly showing water pipes, taps, water supply infrastructure, or visible water leakage belongs to Water Supply.
- Any image mainly showing electrical wires, electric poles, transformers, or power equipment belongs to Electricity.
- Any image mainly showing a streetlight, lamp post, or light pole belongs to Streetlights.
- Any image mainly showing a drain, sewer, drainage channel, or accumulated water belongs to Drainage.
- Any image mainly showing a traffic signal, traffic sign, road barrier, or traffic-control equipment belongs to Traffic.
- If multiple civic objects are visible, choose the main subject occupying the most important part of the image.
- Choose Other ONLY when the image does not clearly show any recognizable civic object or area.
- Never invent a category for an object that is not visible.

Return ONLY JSON in exactly this format:
{
    "title": "Large pothole on road",
    "description": "The image shows a road surface with a large pothole.",
    "category": "Roads & Potholes",
    "summary": "Large pothole visible on the road"
}

Rules for the response:
- title must be a concise issue title under 80 characters.
- description must describe only the visible civic object or problem in under 300 characters.
- summary must be under 120 characters.
- category must exactly match one allowed category.
- Do not return markdown, explanations, or extra fields.
`;

        const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    inline_data: {
                                        mime_type: imageMatch[1],
                                        data: imageMatch[2]
                                    }
                                },
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0
                    }
                })
            }
        );

        const responseData = await geminiResponse.json();

        // IMPORTANT: log Gemini's REAL response
        console.log(
            'GEMINI RAW RESPONSE:',
            JSON.stringify(responseData, null, 2)
        );

        if (!geminiResponse.ok) {
            console.error('GEMINI API ERROR:', responseData);

            const upstreamMessage = responseData.error?.message || `Gemini request failed with status ${geminiResponse.status}`;
            return response.status(502).json({
                message: `Gemini API error: ${upstreamMessage}`
            });
        }

        const rawText =
            responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log('GEMINI RAW TEXT:', rawText);

        const result = parseDetection(rawText);

        console.log('PARSED RESULT:', result);

        if (!result) {
            return response.status(502).json({
                message: 'Gemini returned an invalid classification response',
                raw: rawText
            });
        }

        const title =
            typeof result.title === 'string' && result.title.trim()
                ? result.title.trim().slice(0, 80)
                : 'Civic infrastructure issue';

        const description =
            typeof result.description === 'string' && result.description.trim()
                ? result.description.trim().slice(0, 300)
                : (typeof result.summary === 'string' ? result.summary.trim().slice(0, 300) : 'Visible civic infrastructure problem detected.');

        const summary =
            typeof result.summary === 'string'
                ? result.summary.trim().slice(0, 120)
                : description.slice(0, 120);

        const category = normalizeCategory(
            result.category,
            summary
        );

        console.log('FINAL CATEGORY:', category);

        return response.json({
            category,
            title,
            description,
            summary
        });

    } catch (error) {
        console.error('IMAGE DETECTION ERROR:', error);

        return response.status(502).json({
            message: 'AI issue detection is temporarily unavailable',
            error: error.message
        });
    }
};



export const uploadIssueImage = async (image) => {
    if (!image) return null;
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary unsigned upload preset is not configured');
    }

    const requestBody = new URLSearchParams({
        file: image,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    let uploadResponse;
    try {
        uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: requestBody,
        });
    } catch (error) {
        throw new Error(`Cloudinary connection failed: ${error.message}`);
    }

    const responseText = await uploadResponse.text();
    let uploadData;
    try {
        uploadData = JSON.parse(responseText || '{}');
    } catch (error) {
        throw new Error('Cloudinary returned an invalid upload response');
    }
    if (!uploadResponse.ok || !uploadData.secure_url) {
        if (uploadResponse.status === 401 || uploadResponse.status === 403) {
            throw new Error('Cloudinary rejected the unsigned upload preset. Check that ml_default is enabled for unsigned uploads.');
        }
        throw new Error(uploadData.error?.message || 'Cloudinary upload failed');
    }
    return uploadData.secure_url;
};

const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
        return null;
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const parseCoordinates = (locString, lat, lon) => {
    if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
    }
    if (typeof locString === 'string') {
        const match = locString.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
        if (match) {
            const pLat = parseFloat(match[1]);
            const pLon = parseFloat(match[2]);
            if (!isNaN(pLat) && !isNaN(pLon)) {
                return { latitude: pLat, longitude: pLon };
            }
        }
    }
    return { latitude: null, longitude: null };
};

const civicStopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'are', 'was', 'were', 'it', 'this', 'that', 'there', 'here',
    'please', 'near', 'very', 'big', 'small', 'huge', 'broken', 'issue', 'problem',
    'need', 'repair', 'fixed', 'road', 'street', 'city', 'area'
]);

const tokenizeCivicText = (text) => {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !civicStopwords.has(w));
};

const calculateTextSimilarity = (text1, text2) => {
    const tokens1 = new Set(tokenizeCivicText(text1));
    const tokens2 = new Set(tokenizeCivicText(text2));
    if (tokens1.size === 0 || tokens2.size === 0) return 0;
    let intersection = 0;
    for (const t of tokens1) {
        if (tokens2.has(t)) intersection += 1;
    }
    const union = new Set([...tokens1, ...tokens2]).size;
    return union > 0 ? intersection / union : 0;
};

const checkGeminiDuplicate = async (newReport, candidate, distanceMeters) => {
    if (!process.env.GEMINI_API_KEY) return null;
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const prompt = `You are a Municipal Civic Duplicate Detection AI for a SmartCity platform.
Compare these two citizen complaint reports and determine if they describe the EXACT SAME physical civic problem at the same location.

NEW REPORT:
- Category: ${newReport.category}
- Title/Subject: ${newReport.aiTitle || 'None'}
- Description: ${newReport.description}
- AI Summary: ${newReport.aiSummary || 'None'}

EXISTING ACTIVE REPORT (${Math.round(distanceMeters)} meters away):
- Category: ${candidate.category}
- Title/Subject: ${candidate.aiTitle || 'None'}
- Description: ${candidate.description}
- AI Summary: ${candidate.aiSummary || 'None'}

Are these two reports describing the exact same physical issue (e.g. the same pothole, overflowing garbage bin, water leak, fallen line, blocked drain)?
Return ONLY JSON with this format:
{
  "isDuplicate": true,
  "confidence": 0.95,
  "reason": "Both describe the exact same large pothole near the intersection."
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0,
                    },
                }),
            }
        );
        clearTimeout(timeoutId);
        if (!geminiResponse.ok) return null;
        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;
        return parseDetection(text);
    } catch {
        clearTimeout(timeoutId);
        return null;
    }
};

const findDuplicateIssue = async ({ category, location, latitude, longitude, description, aiTitle, aiSummary }) => {
    const coords = parseCoordinates(location, latitude, longitude);

    // Retrieve active non-resolved issues
    const activeCandidates = await Issue.find({
        status: { $ne: 'Resolved' },
    }).populate('reporter', 'name email').populate('assignedWorker', 'name department');

    if (!activeCandidates || activeCandidates.length === 0) {
        return null;
    }

    const matches = [];

    for (const candidate of activeCandidates) {
        const candidateCoords = parseCoordinates(candidate.location, candidate.latitude, candidate.longitude);
        let distanceMeters = null;

        if (coords.latitude !== null && coords.longitude !== null && candidateCoords.latitude !== null && candidateCoords.longitude !== null) {
            distanceMeters = calculateDistanceMeters(
                coords.latitude,
                coords.longitude,
                candidateCoords.latitude,
                candidateCoords.longitude
            );
            // Search radius boundary: 200 meters
            if (distanceMeters > 200) {
                continue;
            }
        } else {
            // Fallback: Check if location string is similar if coordinates unavailable
            const locNormNew = String(location || '').toLowerCase().trim();
            const locNormCand = String(candidate.location || '').toLowerCase().trim();
            if (!locNormNew || !locNormCand || (locNormNew !== locNormCand && !locNormNew.includes(locNormCand) && !locNormCand.includes(locNormNew))) {
                continue;
            }
            distanceMeters = 30; // Nominal distance for matching location string
        }

        // Category matching: identical or related
        const isSameCategory = candidate.category === category;
        const newFullText = `${category} ${aiTitle || ''} ${description} ${aiSummary || ''}`.toLowerCase();
        const candFullText = `${candidate.category} ${candidate.aiTitle || ''} ${candidate.description} ${candidate.aiSummary || ''}`.toLowerCase();
        const textSimilarity = calculateTextSimilarity(newFullText, candFullText);

        // Run Gemini AI verification if within radius
        let aiDecision = null;
        if (distanceMeters <= 200) {
            aiDecision = await checkGeminiDuplicate(
                { category, aiTitle, description, aiSummary },
                candidate,
                distanceMeters
            );
        }

        if (aiDecision && typeof aiDecision.isDuplicate === 'boolean') {
            if (aiDecision.isDuplicate && (aiDecision.confidence === undefined || aiDecision.confidence >= 0.6)) {
                matches.push({
                    candidate,
                    distanceMeters: Math.round(distanceMeters),
                    confidence: aiDecision.confidence || 0.9,
                    reason: aiDecision.reason || 'AI verified duplicate civic issue',
                });
                continue;
            }
            if (!aiDecision.isDuplicate && aiDecision.confidence >= 0.8) {
                // AI strongly determined this is a distinct issue
                continue;
            }
        }

        // Fallback Algorithmic Scoring (if Gemini unavailable or ambiguous)
        // If within 60 meters and same category with slight text overlap
        if (isSameCategory && distanceMeters <= 60 && textSimilarity >= 0.15) {
            matches.push({
                candidate,
                distanceMeters: Math.round(distanceMeters),
                confidence: 0.85,
                reason: 'Proximity (<60m) and category match with shared civic terminology',
            });
            continue;
        }

        // If within 150 meters and same category with moderate text overlap
        if (isSameCategory && distanceMeters <= 150 && textSimilarity >= 0.3) {
            matches.push({
                candidate,
                distanceMeters: Math.round(distanceMeters),
                confidence: 0.8,
                reason: 'Proximity (<150m) and semantic text similarity',
            });
            continue;
        }

        // If within 200 meters with high text overlap
        if (distanceMeters <= 200 && textSimilarity >= 0.45) {
            matches.push({
                candidate,
                distanceMeters: Math.round(distanceMeters),
                confidence: 0.75,
                reason: 'High semantic text similarity within 200m radius',
            });
            continue;
        }
    }

    if (matches.length === 0) return null;

    // Sort by highest confidence and shortest distance
    matches.sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return a.distanceMeters - b.distanceMeters;
    });

    return matches[0];
};

const publicIssue = (issue, requestUserId = null) => ({
    id: issue._id,
    category: issue.category,
    location: issue.location,
    latitude: issue.latitude,
    longitude: issue.longitude,
    description: issue.description,
    aiTitle: issue.aiTitle,
    aiDescription: issue.aiDescription,
    aiDetectedCategory: issue.aiDetectedCategory,
    aiSummary: issue.aiSummary,
    imageUrl: issue.imageUrl,
    status: issue.status,
    reviewStatus: issue.reviewStatus,
    priority: issue.priority || 'Medium',
    department: issue.department,
    reportCount: issue.reportCount || 1,
    duplicateReportersCount: (issue.duplicateReporters?.length || 0) + 1,
    isCoReported: Boolean(
        requestUserId &&
        issue.duplicateReporters?.some((r) => {
            const rId = r.user?._id ? r.user._id.toString() : r.user?.toString();
            return rId === requestUserId.toString();
        })
    ),
    reporter: issue.reporter ? {
        id: issue.reporter._id || issue.reporter,
        name: issue.reporter.name || 'Citizen',
    } : null,
    assignedWorker: issue.assignedWorker ? {
        id: issue.assignedWorker._id || issue.assignedWorker,
        name: issue.assignedWorker.name,
        department: issue.assignedWorker.department,
    } : null,
    workerProofImage: issue.workerProofImage,
    proofReviewStatus: issue.proofReviewStatus,
    workerCompletionStatus: issue.workerCompletionStatus,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
});

export const getMyIssues = async (request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const userId = request.user.userId;
        const issues = await Issue.find({
            $or: [
                { reporter: userId },
                { 'duplicateReporters.user': userId },
            ],
        })
            .populate('reporter', 'name email')
            .populate('assignedWorker', 'name department')
            .sort({ createdAt: -1 });

        return response.json({ issues: issues.map((i) => publicIssue(i, userId)) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load your reports' });
    }
};

export const getCommunityIssues = async (request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const { lat, lng, radius } = request.query || {};
        const issues = await Issue.find()
            .populate('reporter', 'name email')
            .populate('assignedWorker', 'name department')
            .sort({ createdAt: -1 })
            .limit(120);

        let mapped = issues.map((i) => publicIssue(i));

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius) || 5;

        if (!isNaN(userLat) && !isNaN(userLng)) {
            mapped = mapped.map((issue) => {
                const coords = parseCoordinates(issue.location, issue.latitude, issue.longitude);
                let distanceKm = null;
                if (coords.latitude !== null && coords.longitude !== null) {
                    const distMeters = calculateDistanceMeters(userLat, userLng, coords.latitude, coords.longitude);
                    if (distMeters !== null) {
                        distanceKm = distMeters / 1000;
                    }
                }
                return {
                    ...issue,
                    distanceKm,
                };
            });

            if (radius !== 'all') {
                mapped = mapped.filter((item) => item.distanceKm !== null && item.distanceKm <= radiusKm);
            }

            mapped.sort((a, b) => {
                if (a.distanceKm === null && b.distanceKm === null) return 0;
                if (a.distanceKm === null) return 1;
                if (b.distanceKm === null) return -1;
                return a.distanceKm - b.distanceKm;
            });
        }

        return response.json({ issues: mapped, total: mapped.length });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load community reports' });
    }
};

export const getCivicStats = async (_request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const [total, resolved, inProgress, critical, categoryCounts] = await Promise.all([
            Issue.countDocuments(),
            Issue.countDocuments({ status: 'Resolved' }),
            Issue.countDocuments({ status: 'In progress' }),
            Issue.countDocuments({ priority: { $in: ['High', 'Critical'] }, status: { $ne: 'Resolved' } }),
            Issue.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
        ]);

        return response.json({
            total,
            resolved,
            inProgress,
            critical,
            resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
            categoryCounts,
        });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load civic statistics' });
    }
};

export const createIssue = async (request, response) => {
    try {
        const { category, location, latitude, longitude, description, image, aiTitle, aiDescription, aiDetectedCategory, aiSummary } = request.body;
        if (!category || !location || !description) {
            return response.status(400).json({ message: 'Issue type, location, and description are required' });
        }

        if (image && (!image.startsWith('data:image/') || image.length > 7 * 1024 * 1024)) {
            return response.status(400).json({ message: 'Please upload an image smaller than 5 MB' });
        }

        let imageUrl = null;
        if (image && process.env.ISSUE_IMAGE_DATABASE_FALLBACK === 'true') {
            imageUrl = image;
        } else if (image) {
            try {
                imageUrl = await uploadIssueImage(image);
            } catch (error) {
                return response.status(502).json({ message: error.message });
            }
        }

        // =========================================================================
        // AI DUPLICATE ISSUE DETECTION ENGINE
        // =========================================================================
        const duplicateMatch = await findDuplicateIssue({
            category,
            location,
            latitude: typeof latitude === 'number' ? latitude : undefined,
            longitude: typeof longitude === 'number' ? longitude : undefined,
            description,
            aiTitle,
            aiSummary,
        });

        if (duplicateMatch) {
            const { candidate, distanceMeters, reason } = duplicateMatch;
            const currentUserId = request.user.userId;

            // Increment report count
            candidate.reportCount = (candidate.reportCount || 1) + 1;

            // Record this reporting citizen in duplicateReporters if not already recorded
            const isOriginalReporter = candidate.reporter?._id
                ? candidate.reporter._id.toString() === currentUserId.toString()
                : candidate.reporter?.toString() === currentUserId.toString();

            const alreadyInDuplicates = candidate.duplicateReporters?.some((entry) => {
                const eUserId = entry.user?._id ? entry.user._id.toString() : entry.user?.toString();
                return eUserId === currentUserId.toString();
            });

            if (!isOriginalReporter && !alreadyInDuplicates) {
                candidate.duplicateReporters.push({
                    user: currentUserId,
                    reportedAt: new Date(),
                    description,
                    imageUrl: imageUrl || undefined,
                });
            }

            // Save updated existing issue
            await candidate.save();

            const populatedCandidate = await Issue.findById(candidate._id)
                .populate('reporter', 'name email')
                .populate('assignedWorker', 'name department');

            return response.status(200).json({
                isDuplicate: true,
                message: 'This issue has already been reported.',
                distanceMeters,
                reason,
                issue: publicIssue(populatedCandidate, currentUserId),
                existingIssue: {
                    id: populatedCandidate._id,
                    title: populatedCandidate.aiTitle || populatedCandidate.description,
                    category: populatedCandidate.category,
                    location: populatedCandidate.location,
                    status: populatedCandidate.status,
                    priority: populatedCandidate.priority,
                    reportCount: populatedCandidate.reportCount,
                    createdAt: populatedCandidate.createdAt,
                    reportedBy: populatedCandidate.reporter?.name || 'Fellow Citizen',
                    distanceMeters,
                    imageUrl: populatedCandidate.imageUrl,
                    assignedWorker: populatedCandidate.assignedWorker ? {
                        name: populatedCandidate.assignedWorker.name,
                        department: populatedCandidate.assignedWorker.department,
                    } : null,
                },
            });
        }

        // =========================================================================
        // NO DUPLICATE FOUND: CREATE NEW CIVIC ISSUE
        // =========================================================================
        const issue = await Issue.create({
            reporter: request.user.userId,
            category,
            location,
            latitude: typeof latitude === 'number' ? latitude : undefined,
            longitude: typeof longitude === 'number' ? longitude : undefined,
            description,
            aiTitle,
            aiDescription,
            aiDetectedCategory,
            aiSummary,
            imageUrl,
            reportCount: 1,
            duplicateReporters: [],
        });

        const populatedNewIssue = await Issue.findById(issue._id)
            .populate('reporter', 'name email')
            .populate('assignedWorker', 'name department');

        return response.status(201).json({
            isDuplicate: false,
            issue: publicIssue(populatedNewIssue, request.user.userId),
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return response.status(400).json({ message: 'Please provide a valid issue type and description' });
        }
        return response.status(500).json({ message: 'Unable to submit issue report' });
    }
};
