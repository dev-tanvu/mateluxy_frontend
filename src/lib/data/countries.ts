export interface Country {
    name: string;
    code: string;
    dial_code: string;
}

export const countries: Country[] = [
    { name: "United Arab Emirates", code: "AE", dial_code: "+971" },
    { name: "United States", code: "US", dial_code: "+1" },
    { name: "United Kingdom", code: "GB", dial_code: "+44" },
    { name: "Canada", code: "CA", dial_code: "+1" },
    { name: "India", code: "IN", dial_code: "+91" },
    { name: "Pakistan", code: "PK", dial_code: "+92" },
    { name: "Bangladesh", code: "BD", dial_code: "+880" },
    { name: "Saudi Arabia", code: "SA", dial_code: "+966" },
    { name: "Qatar", code: "QA", dial_code: "+974" },
    { name: "Kuwait", code: "KW", dial_code: "+965" },
    { name: "Bahrain", code: "BH", dial_code: "+973" },
    { name: "Oman", code: "OM", dial_code: "+968" },
    { name: "Egypt", code: "EG", dial_code: "+20" },
    { name: "Jordan", code: "JO", dial_code: "+962" },
    { name: "Lebanon", code: "LB", dial_code: "+961" },
    { name: "France", code: "FR", dial_code: "+33" },
    { name: "Germany", code: "DE", dial_code: "+49" },
    { name: "Italy", code: "IT", dial_code: "+39" },
    { name: "Spain", code: "ES", dial_code: "+34" },
    { name: "Russia", code: "RU", dial_code: "+7" },
    { name: "China", code: "CN", dial_code: "+86" },
    { name: "Japan", code: "JP", dial_code: "+81" },
    { name: "South Korea", code: "KR", dial_code: "+82" },
    { name: "Singapore", code: "SG", dial_code: "+65" },
    { name: "Malaysia", code: "MY", dial_code: "+60" },
    { name: "Indonesia", code: "ID", dial_code: "+62" },
    { name: "Philippines", code: "PH", dial_code: "+63" },
    { name: "Vietnam", code: "VN", dial_code: "+84" },
    { name: "Thailand", code: "TH", dial_code: "+66" },
    { name: "Australia", code: "AU", dial_code: "+61" },
    { name: "New Zealand", code: "NZ", dial_code: "+64" },
    { name: "Turkey", code: "TR", dial_code: "+90" },
    { name: "South Africa", code: "ZA", dial_code: "+27" },
    { name: "Nigeria", code: "NG", dial_code: "+234" },
    { name: "Brazil", code: "BR", dial_code: "+55" },
    { name: "Mexico", code: "MX", dial_code: "+52" },
    { name: "Argentina", code: "AR", dial_code: "+54" },
];

export const getFlagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
