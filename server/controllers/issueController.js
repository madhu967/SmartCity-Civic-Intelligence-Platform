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

const publicIssue = (issue) => ({
    id: issue._id,
    category: issue.category,
    location: issue.location,
    latitude: issue.latitude,
    longitude: issue.longitude,
    description: issue.description,
    imageUrl: issue.imageUrl,
    status: issue.status,
    department: issue.department,
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
        const issues = await Issue.find({ reporter: request.user.userId }).populate('assignedWorker', 'name department').sort({ createdAt: -1 });
        return response.json({ issues: issues.map(publicIssue) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load your reports' });
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
        });
        return response.status(201).json({ issue: publicIssue(issue) });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return response.status(400).json({ message: 'Please provide a valid issue type and description' });
        }
        return response.status(500).json({ message: 'Unable to submit issue report' });
    }
};
