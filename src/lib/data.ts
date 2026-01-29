import { Activity, Apple, HeartPulse, Phone, Scale } from "lucide-react"

export const services = [
    {
        id: "discovery-call",
        title: "Free Discovery Call",
        slug: "discovery-call",
        icon: Phone,
        shortDescription: "A complimentary 5-minute chat to discuss your goals and see if we're a fit.",
        fullDescription: "Not sure where to start? Book a free 5-minute discovery call with our nutritionists. We'll briefly discuss your health goals and help you choose the right plan for your journey.",
        features: [
            "5-minute duration",
            "Available Mon-Fri, 1:30 - 2:30 PM",
            "Plan recommendation",
            "No obligation"
        ],
        targetAudience: "Anyone unsure about which nutrition plan is right for them.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
    },
    {
        id: "cancer-nutrition",
        title: "Oncology Nutrition Support",
        slug: "cancer-nutrition-support",
        icon: Activity,
        shortDescription: "Specialized nutritional support for managing treatment side effects and promoting recovery.",
        fullDescription: "Comprehensive nutritional assessment and individualized care plans for various cancer types and stages. We focus on strategies for managing treatment-related side effects (nausea, vomiting, fatigue, taste changes, mucositis) and preventing muscle wasting (cachexia).",
        features: [
            "Management of treatment side effects",
            "Prevention of muscle wasting (cachexia)",
            "Appropriate supplementation guidance",
            "Survivorship and long-term wellness support"
        ],
        targetAudience: "Individuals newly diagnosed, undergoing treatment (chemotherapy, radiation, surgery), or in remission.",
        color: "text-orange",
        bgColor: "bg-orange/10",
    },
    {
        id: "diabetes-management",
        title: "Diabetes Management",
        slug: "diabetes-management",
        icon: HeartPulse,
        shortDescription: "Blood sugar regulation and lifestyle modification strategies for Type 1, Type 2, and Pre-diabetes.",
        fullDescription: "Individualized meal planning for effective blood sugar regulation. We provide education on the glycemic index, portion control, and meal timing to improve insulin sensitivity and prevent complications.",
        features: [
            "Blood sugar regulation strategies",
            "Glycemic index education",
            "Portion control & meal timing",
            "Pre-diabetes reversal plans"
        ],
        targetAudience: "Newly diagnosed diabetics, pre-diabetics, those seeking Type II diabetes remission and better glycemic control.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
    },
    {
        id: "gut-health",
        title: "Digestive & Gut Health",
        slug: "gut-health",
        icon: Apple,
        shortDescription: "Dietary interventions for IBS, GERD, and other digestive disorders.",
        fullDescription: "Dietary strategies for managing symptoms related to Irritable Bowel Syndrome (IBS), Hyperacidity, Gastritis, GERD, and Crohn's disease. We offer guidance on elimination diets (FODMAP) and gut microbiome optimization.",
        features: [
            "Symptom management (Bloating, Acid Reflux)",
            "FODMAP & Elimination diets",
            "Gut microbiome optimization",
            "Reintroduction protocols"
        ],
        targetAudience: "Individuals with persistent digestive discomfort or diagnosed conditions.",
        color: "text-olive",
        bgColor: "bg-olive/10",
    },
    {
        id: "general-counselling",
        title: "General Nutrition Counselling",
        slug: "general-counselling",
        icon: Scale,
        shortDescription: "Weight management, hypertension control, and general wellness guidance.",
        fullDescription: "Holistic support for healthy weight loss or gain, cholesterol and hypertension management. We also offer renal nutrition guidance and general preventive care.",
        features: [
            "Weight Management (Loss/Gain)",
            "Hypertension & Cholesterol Control",
            "Renal (Kidney) Nutrition",
            "Preventive Care"
        ],
        targetAudience: "Anyone seeking to improve their general health and prevent chronic diseases.",
        color: "text-olive",
        bgColor: "bg-olive/10",
    },
]

export const pricing = {
    default: {
        virtual: 2500,
        inPerson: 3000,
    },
    diabetes: {
        virtual: 3000,
        inPerson: 3500,
        note: "Includes a personalized meal plan / guidelines."
    },
    packages: [
        {
            name: "Kickstart Package",
            description: "Initial Consultation (60-75 min) + 1 Follow-up (30-45 min)",
            priceRange: "Ksh 5,000 - 5,500"
        },
        {
            name: "Wellness Journey",
            description: "Initial Consultation + 3 Follow-up Sessions",
            priceRange: "Ksh 9,000 - 10,000"
        }
    ],
    footerNote: "For Cancer, General wellness & Gut health: extra charges apply for individualized meal plans."
}

export const processSteps = [
    {
        number: "01",
        title: "Discovery Call",
        description: "We start with a free chat to understand your needs and determine if we're a good fit."
    },
    {
        number: "02",
        title: "In-Depth Assessment",
        description: "A comprehensive review of your medical history, lifestyle, and dietary habits."
    },
    {
        number: "03",
        title: "Personalized Plan",
        description: "You receive a tailored nutrition strategy designed specifically for your goals."
    },
    {
        number: "04",
        title: "Ongoing Support",
        description: "Regular check-ins and adjustments to ensure you stay on track and see results."
    }
]

export const faqs = [
    {
        question: "Do you accept insurance?",
        answer: "At this time, we operate as a self-pay practice and do not accept insurance. However, as we continue to grow, we are actively working towards establishing partnerships with insurance providers in the future to make our services more accessible. We appreciate your understanding and are happy to discuss payment options that work for you."
    },
    {
        question: "Is it virtual or in-person?",
        answer: "We offer both! We have a comfortable clinic for in-person consultations and a secure telehealth platform for virtual sessions, allowing us to support clients regardless of their location."
    },
    {
        question: "What is your cancellation policy?",
        answer: "We kindly request at least 12 hours' notice for cancellations or rescheduling. This allows us to offer the appointment slot to another client who may need it. We understand that life happens, and we're happy to work with you to find a suitable alternative time."
    },
    {
        question: "Can I get support between sessions?",
        answer: "Absolutely. Our packages include secure messaging support between appointments for quick questions, motivation, and troubleshooting so you never feel alone in your journey."
    }
]
