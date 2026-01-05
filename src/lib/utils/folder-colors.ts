import { CSSProperties } from 'react';

/**
 * Calculates the CSS filter style for a folder icon based on its label color.
 * Assumes the base folder icon is Yellow (approx hue 50deg).
 * 
 * @param colorName The name of the color (e.g., 'Red', 'Blue')
 * @returns CSSProperties object with the appropriate filter
 */
export const getFolderStyle = (colorName?: string | null): CSSProperties => {
    if (!colorName) return {};

    const name = colorName.toLowerCase();

    // Base Hue: 50deg (Yellow)
    // Formula: Target Hue - 50

    // Adjustments:
    // Red: 0/360 - 50 = 310
    // Orange: 30 - 50 = 340 (-20)
    // Yellow: 50 - 50 = 0
    // Green: 120 - 50 = 70
    // Blue: 210 - 50 = 160
    // Purple: 270 - 50 = 220
    // Pink: 300 - 50 = 250

    switch (name) {
        case 'red':
            return { filter: 'hue-rotate(310deg)' };
        case 'orange':
            return { filter: 'hue-rotate(340deg)' };
        case 'yellow':
            return {}; // No filter needed for base color
        case 'green':
            return { filter: 'hue-rotate(70deg)' };
        case 'blue':
            return { filter: 'hue-rotate(160deg)' };
        case 'purple':
            return { filter: 'hue-rotate(220deg)' };
        case 'pink':
            return { filter: 'hue-rotate(250deg)' };
        case 'gray':
            return { filter: 'grayscale(100%) opacity(0.8)' };
        default:
            return {};
    }
};

export const folderColors = [
    { name: 'Red', value: '#FF5C5C' },
    { name: 'Orange', value: '#FFBD5C' },
    { name: 'Yellow', value: '#FFEA5C' },
    { name: 'Green', value: '#5CFF89' },
    { name: 'Blue', value: '#00AAFF' },
    { name: 'Purple', value: '#A65CFF' },
    { name: 'Pink', value: '#FF5CC7' },
    { name: 'Gray', value: '#A0A0A0' },
];
