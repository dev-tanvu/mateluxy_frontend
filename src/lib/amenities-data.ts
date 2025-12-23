export interface AmenityItem {
    slug: string;
    label: string;
    category: string;
}

export const RESIDENTIAL_AMENITIES: AmenityItem[] = [
    // Cooling
    { slug: 'central-ac', label: 'Central A/C', category: 'Cooling' },

    // Storage
    { slug: 'built-in-wardrobes', label: 'Built-in Wardrobes', category: 'Storage' },
    { slug: 'walk-in-closet', label: 'Walk-in Closet', category: 'Storage' },

    // Kitchen
    { slug: 'kitchen-appliances', label: 'Kitchen Appliances', category: 'Kitchen' },

    // Extra Rooms
    { slug: 'maids-room', label: 'Maids Room', category: 'Extra Rooms' },
    { slug: 'study', label: 'Study', category: 'Extra Rooms' },
    { slug: 'driver-room', label: 'Driver Room', category: 'Extra Rooms' },
    { slug: 'laundry-room', label: 'Laundry Room', category: 'Extra Rooms' },

    // Outdoor
    { slug: 'balcony', label: 'Balcony', category: 'Outdoor' },
    { slug: 'private-garden', label: 'Private Garden', category: 'Outdoor' },
    { slug: 'private-pool', label: 'Private Pool', category: 'Outdoor' },
    { slug: 'private-jacuzzi', label: 'Private Jacuzzi', category: 'Outdoor' },

    // Building
    { slug: 'shared-pool', label: 'Shared Pool', category: 'Building' },
    { slug: 'shared-gym', label: 'Shared Gym', category: 'Building' },
    { slug: 'shared-spa', label: 'Shared Spa', category: 'Building' },
    { slug: 'security', label: 'Security', category: 'Building' },
    { slug: 'concierge', label: 'Concierge', category: 'Building' },

    // Views
    { slug: 'view-of-water', label: 'View of Water', category: 'Views' },
    { slug: 'view-of-landmark', label: 'View of Landmark', category: 'Views' },

    // Lifestyle
    { slug: 'pets-allowed', label: 'Pets Allowed', category: 'Lifestyle' },
    { slug: 'childrens-play-area', label: 'Children Play Area', category: 'Lifestyle' },
    { slug: 'barbecue-area', label: 'Barbecue Area', category: 'Lifestyle' },
];

export const COMMERCIAL_AMENITIES: AmenityItem[] = [
    { slug: 'conference-room', label: 'Conference Room', category: 'Commercial' },
    { slug: 'networked', label: 'Networked (IT)', category: 'Commercial' },
    { slug: 'dining-in-building', label: 'Dining in Building', category: 'Commercial' },
    { slug: 'shared-pantry', label: 'Shared Pantry', category: 'Commercial' },
    { slug: 'visitor-parking', label: 'Visitor Parking', category: 'Commercial' },
];

export const getAmenitiesByCategory = (category: string) => {
    if (category && category.toLowerCase() === 'commercial') {
        return COMMERCIAL_AMENITIES;
    }
    return RESIDENTIAL_AMENITIES;
};
