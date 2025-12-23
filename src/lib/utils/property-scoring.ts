import { OffPlanProperty } from '@/lib/services/off-plan-property.service';
import { Property } from '@/services/property.service';

export function calculatePropertyScore(property: OffPlanProperty | Property): number {
    let score = 0;
    const p = property as any; // Use weak type for flexibility across two distinct interfaces

    // 1. Basic Information (Max 20)
    // Title
    if (p.projectTitle || p.propertyTitle) score += 5;

    // Type/Category
    if ((p.propertyType && p.propertyType.length > 0) || p.category) score += 5;

    // Stats
    if ((p.bedrooms || 0) > 0 && (p.bathrooms || 0) > 0 && (p.area || 0) > 0) score += 5;

    // Price
    if ((p.startingPrice || p.price) > 0) score += 5;

    // Description Quality (Max 10)
    const description = p.projectDescription || p.propertyDescription;
    if (description) {
        const length = description.length;
        if (length > 500) score += 10;
        else if (length > 200) score += 5;
        else score += 2;
    }

    // 2. Location (Max 10)
    if (p.latitude && p.longitude) score += 5;
    if (p.address || p.emirate) score += 5;

    // 3. Media (Max 35)
    if (p.coverPhoto) score += 10;

    // Image Count
    let imageCount = 0;
    if (p.mediaImages) {
        imageCount = p.mediaImages.length;
    } else {
        imageCount = (p.exteriorMedia?.length || 0) + (p.interiorMedia?.length || 0);
    }
    score += Math.min(imageCount, 10);

    // Floor Plans / Media Bonus
    if (p.floorPlans && p.floorPlans.length > 0) {
        score += 10;
    } else if (p.mediaImages && imageCount > 5) {
        score += 5; // Bonus for good gallery if no floor plans
    }

    // Video/Tour
    if (p.videoUrl || p.virtualTourUrl || p.agentVideoUrl) score += 5;

    // 4. Additional Details (Max 25)
    // Amenities
    if (p.amenities && p.amenities.length > 5) score += 10;
    else if (p.amenities && p.amenities.length > 0) score += 5;

    // Payment Plan
    if (p.paymentPlan) score += 5;
    else if (p.cheques || p.numberOfCheques) score += 5;

    // DLD Permit
    if (p.dldPermitNumber) score += 10;

    // 5. Agent/Developer (Max 10)
    if (p.assignedAgentId || p.developerId) score += 10;

    return Math.min(score, 100);
}

export function getScoreColor(score: number): { bg: string; text: string; icon: string } {
    if (score >= 80) {
        return { bg: '#E8F5E9', text: '#4CAF50', icon: '#4CAF50' }; // Green
    } else if (score >= 50) {
        return { bg: '#FFF8E1', text: '#FFB300', icon: '#FFB300' }; // Orange
    } else {
        return { bg: '#FFEBEE', text: '#EF5350', icon: '#EF5350' }; // Red
    }
}
